import { createClient } from 'redis';
import logger from '../utils/logger';

const redisClient = createClient({
  socket: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
  database: process.env.REDIS_SHARED_DB,
});

redisClient.on('connect', () => console.log('🟢 Redis 連線成功！'));
redisClient.on('error', (err) => console.log('🔴 Redis 連線錯誤:', err));

try {
  await redisClient.connect();
} catch {
  logger.error('🔴 無法連線到 Redis，請檢查設定和服務狀態');
}

export default redisClient;
