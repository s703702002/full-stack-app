import 'dotenv/config';
import { connectDB } from './config/db.js';
import { connectRedis } from './config/redis.js';
import logger from './utils/logger.js';

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    const { default: app } = await import('./app.js');

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      logger.info(`伺服器已啟動: http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('啟動伺服器時發生嚴重錯誤:', error);
    process.exit(1);
  }
};

startServer();
