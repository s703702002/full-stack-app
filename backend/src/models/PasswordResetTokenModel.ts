import prisma from '../config/db.js';
import type { Prisma } from '../generated/client.js';

const PasswordResetTokenModel = {
  createResetToken: async (data: Prisma.PasswordResetTokenCreateInput) => {
    return await prisma.passwordResetToken.create({
      data,
    });
  },
  deleteByUserId: async (userId: string) => {
    return await prisma.passwordResetToken.deleteMany({
      where: { userId },
    });
  },
};

export default PasswordResetTokenModel;
