import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

try {
  await prisma.$connect();
  console.log('🟢 Prisma ORM 已成功連線至 PostgreSQL！');
} catch (err) {
  console.error('🔴 Prisma 連線失敗:', err);
  process.exit(1);
}

export default prisma;
