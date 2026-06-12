import prisma from '../config/db.js';
import type { Prisma } from '../generated/client.js';

export const findActiveBan = async (userId: string) => {
  return await prisma.userBan.findFirst({
    where: {
      userId,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });
};

export const createBan = async (
  adminId: string,
  targetUserId: string,
  reason: string,
  expiresAt: Prisma.UserBanCreateInput['createdAt'] | null,
) => {
  return prisma.userBan.create({
    data: {
      adminId,
      userId: targetUserId,
      reason,
      expiresAt: expiresAt,
    },
  });
};

export const deleteById = async (banId: string) => {
  return prisma.userBan.delete({
    where: { id: banId },
  });
};
