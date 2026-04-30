import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
const prisma = new PrismaClient();

try {
  await prisma.$connect();
  logger.info('🟢 Prisma ORM 已成功連線至 PostgreSQL！');
} catch (err) {
  logger.error(err, '🔴 Prisma 連線失敗:');
  process.exit(1);
}

export default prisma;
