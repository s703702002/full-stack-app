import { createClient } from 'redis';
import logger from '../utils/logger';

const redisClient = createClient({
  socket: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
  database: process.env.REDIS_SHARED_DB,
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
