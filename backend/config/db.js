import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client';
import logger from '../utils/logger';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

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
