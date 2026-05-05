import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('🟢 Prisma 連線成功');
  } catch (err) {
    logger.error(err, '🔴 Prisma 連線失敗:');
    process.exit(1);
  }
};

export default prisma;
