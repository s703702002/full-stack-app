import { createClient } from 'redis';
import logger from '../utils/logger.js';
import { env } from '../utils/validateEnv.js';

const redisClient = createClient({
  socket: { host: env.REDIS_HOST, port: Number(env.REDIS_PORT) },
  database: Number(env.REDIS_SHARED_DB),
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    logger.info('🟢 Redis 連線成功');
  } catch {
    logger.error('🔴 Redis 連線失敗，無法啟動伺服器');
    process.exit(1);
  }
};

export default redisClient;
