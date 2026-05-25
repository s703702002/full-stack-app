import prisma from '../config/db.js';
import redisClient from '../config/redis.js';
import { healthCheck } from '../utils/s3Utils.js';

export const checkHealth = async (req, res) => {
  const healthData = {
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
    // 執行最輕量的原生 SQL 查詢，確認資料庫連線真的活著
    await prisma.$queryRaw`SELECT 1`;
    healthData.services.database = 'connected';
  } catch (error) {
    healthData.services.database = 'disconnected';
    isSystemHealthy = false; // DB 掛了，系統算是不健康
    console.error('HealthCheck [DB Error]:', error.message);
  }

  try {
    if (redisClient.isReady) {
      const pingResult = await redisClient.ping();
      if (pingResult === 'PONG') {
        healthData.services.redis = 'connected';
      }
    } else {
      healthData.services.redis = 'disconnected';
      // 策略抉擇：如果 Redis 只是輔助（如 Rate Limit），可以不把 isSystemHealthy 設為 false
      // 如果 Redis 是核心（如儲存 Session），那這裡就要 isSystemHealthy = false;
    }
  } catch (error) {
    healthData.services.redis = 'error';
    console.error('HealthCheck [Redis Error]:', error.message);
  }

  try {
    await healthCheck();
    healthData.services.storage = 'connected';
  } catch (error) {
    healthData.services.storage = 'disconnected';
    console.error('HealthCheck [S3/MinIO Error]:', error.message);

    // 架構決策：儲存服務掛掉，整個 API 算不健康嗎？
    // 如果系統的「核心功能」是看文章，S3 掛了只是「看不到圖片、不能換大頭貼」，
    // 那業界通常 "不會" 把 isSystemHealthy 設為 false (也就是不回傳 503)。
    // 因為我們希望使用者還是能正常登入看文字，這叫做「優雅降級 (Graceful Degradation)」。
    // isSystemHealthy = false; // 取決於你的系統特性
  }

  // 正常回 200；如果有致命錯誤回 503 (Service Unavailable)
  const statusCode = isSystemHealthy ? 200 : 503;
  if (!isSystemHealthy) {
    healthData.status = 'error';
  }

  res.status(statusCode).json(healthData);
};

// 將秒數轉成易讀的格式 (例如 1h 2m 3s)
function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}
