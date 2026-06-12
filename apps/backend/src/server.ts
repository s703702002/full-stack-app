import 'dotenv/config';
import { connectDB } from './config/db.js';
import { connectRedis } from './config/redis.js';
import logger from './utils/logger.js';
import { env } from './utils/validateEnv.js';

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    const { default: app } = await import('./app.js');

    app.listen(env.PORT, () => {
      logger.info(`伺服器已啟動: http://localhost:${env.PORT}`);
    });
  } catch (error) {
    logger.error(error, '啟動伺服器時發生嚴重錯誤');
    process.exit(1);
  }
};

startServer();
