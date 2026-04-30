import redisClient from '../config/redis.js';
import logger from './logger.js';

const connectedClients = new Map();

// 🚀 建立 Redis Pub/Sub 專用的 Client
// (Redis 規定：當一個連線變成 Subscriber 後，就不能再執行其他指令，所以我們要 duplicate 複製兩個分身)
const pubClient = redisClient.duplicate();
const subClient = redisClient.duplicate();

// 初始化 Pub/Sub (可以在你伺服器啟動時呼叫，或直接用 IIFE 執行)
(async () => {
  await pubClient.connect();
  await subClient.connect();

  // 🚀 所有伺服器都訂閱同一個頻道：'system_notifications'
  await subClient.subscribe('system_notifications', (message) => {
    // 當 Redis 廣播時，所有機器都會收到這包字串
    const { targetUserId, notificationData } = JSON.parse(message);

    // 每台機器各自檢查自己的 Map 裡面有沒有這個人
    const clientRes = connectedClients.get(targetUserId);
    if (clientRes) {
      clientRes.write(`data: ${JSON.stringify(notificationData)}\n\n`);
    }
  });
})();

export const sseStream = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // 立刻把 Header 送出，建立長連線

  const userId = req.user.id;

  connectedClients.set(userId, res);
  logger.info(`📡 User ${userId} 開始收聽 SSE 廣播`);

  // 發送一個初始連線成功的訊號 (SSE 的格式必須是 data: ... \n\n)
  res.write(
    `data: ${JSON.stringify({ type: 'CONNECTED', message: '通知頻道連線成功' })}\n\n`,
  );

  req.on('close', () => {
    logger.info(`🔌 User ${userId} 斷開了 SSE 連線`);
    connectedClients.delete(userId);
    res.end();
  });
};

export const sendNotification = async (targetUserId, notificationData) => {
  const payload = JSON.stringify({
    targetUserId,
    notificationData,
  });

  // 把訊息丟進 Redis 頻道
  await pubClient.publish('system_notifications', payload);
};
