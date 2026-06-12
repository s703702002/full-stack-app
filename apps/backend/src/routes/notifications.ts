import type { Response } from 'express';
import express from 'express';
import { checkAuthenticated } from '../middlewares/auth.js';
import { addClient, removeClient } from '../utils/sseManager.js';
import logger from '../utils/logger.js';
import { getAuthUser } from '../utils/requestHelper.js';
import { setOffline, setOnline } from '../utils/onlineStatus.js';

const router = express.Router();

router.get('/stream', checkAuthenticated, async (req, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const user = getAuthUser(req);
  const userId = user.id;

  await setOnline(userId);

  addClient(userId, res);

  const heartbeat = setInterval(async () => {
    res.write('event: ping\ndata: {}\n\n');
    await setOnline(user.id); // 更新 TTL
  }, 30 * 1000);

  req.on('close', async () => {
    logger.info(`🔌 User ${userId} 斷開了 SSE 連線`);
    clearInterval(heartbeat);
    removeClient(userId);
    await setOffline(user.id);
    res.end();
  });
});

export default router;
