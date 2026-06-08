import type { Response } from 'express';
import redisClient from '../config/redis.js';
import logger from './logger.js';

const connectedClients = new Map<string, Response>();

export const getConnectedClient = (userId: string) =>
  connectedClients.get(userId);

export const addClient = (userId: string, res: Response) =>
  connectedClients.set(userId, res);

export const removeClient = (userId: string) => connectedClients.delete(userId);

// 建立 Redis Pub/Sub 專用的 Client
// (Redis 規定：當一個連線變成 Subscriber 後，就不能再執行其他指令，所以我們要 duplicate 複製兩個分身)
const pubClient = redisClient.duplicate();
const subClient = redisClient.duplicate();

(async () => {
  await pubClient.connect();
  await subClient.connect();

  // 所有伺服器都訂閱同一個頻道：'system_notifications'
  await subClient.subscribe('system_notifications', (message) => {
    // 當 Redis 廣播時，所有機器都會收到這包字串
    const { targetUserId, notificationData } = JSON.parse(message);

    // 每台機器各自檢查自己的 Map 裡面有沒有這個人
    const clientRes = getConnectedClient(targetUserId);
    if (clientRes) {
      clientRes.write(`data: ${JSON.stringify(notificationData)}\n\n`);
    }
  });
})();

export const sendNotification = async (
  targetUserId: string,
  notificationData: unknown,
) => {
  const payload = JSON.stringify({
    targetUserId,
    notificationData,
  });

  logger.info(notificationData, `📣 發送通知給 User ${targetUserId}`);

  await pubClient.publish('system_notifications', payload);
};
