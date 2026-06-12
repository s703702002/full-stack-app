import type { Request, Response } from 'express';
import prisma from '../config/db.js';
import redisClient from '../config/redis.js';
import { healthCheck } from '../utils/s3Utils.js';
import { getErrorMessage } from '../utils/errorHelper.js';

type ServiceStatus = 'unknown' | 'connected' | 'disconnected' | 'error';

interface HealthData {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: string;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
    storage: ServiceStatus;
  };
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

export const checkHealth = async (_req: Request, res: Response) => {
  const healthData: HealthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: formatUptime(process.uptime()),
    services: {
      database: 'unknown',
      redis: 'unknown',
      storage: 'unknown',
    },
  };

  let isSystemHealthy = true;

  try {
    await prisma.$queryRaw`SELECT 1`;
    healthData.services.database = 'connected';
  } catch (error) {
    healthData.services.database = 'disconnected';
    isSystemHealthy = false;
    console.error('HealthCheck [DB Error]:', getErrorMessage(error));
  }

  try {
    if (redisClient.isReady) {
      const pingResult = await redisClient.ping();
      if (pingResult === 'PONG') {
        healthData.services.redis = 'connected';
      }
    } else {
      healthData.services.redis = 'disconnected';
    }
  } catch (error) {
    healthData.services.redis = 'error';
    console.error('HealthCheck [Redis Error]:', getErrorMessage(error));
  }

  try {
    await healthCheck();
    healthData.services.storage = 'connected';
  } catch (error) {
    healthData.services.storage = 'disconnected';
    console.error('HealthCheck [S3/MinIO Error]:', getErrorMessage(error));
  }

  if (!isSystemHealthy) {
    healthData.status = 'error';
  }

  res.status(isSystemHealthy ? 200 : 503).json(healthData);
};
