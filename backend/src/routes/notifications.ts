import express from 'express';
import { checkAuthenticated } from '../middlewares/auth.js';
import { connectedClients } from '../utils/sseManager.js';
import logger from '../utils/logger.js';
import { getAuthUser } from '../utils/requestHelper.js';

const router = express.Router();

router.get('/stream', checkAuthenticated, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // 立刻把 Header 送出，建立長連線

  const user = getAuthUser(req);
  const userId = user.id;

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
});

export default router;
