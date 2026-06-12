import prisma from '../config/db.js';

const TwoFactorAuthModel = {
  findByUserId: async (userId: string) => {
    return await prisma.twoFactorAuth.findUnique({
      where: { userId },
    });
  },
  upsertTwoFactorAuth: async (userId: string, secret: string) => {
    return await prisma.twoFactorAuth.upsert({
      where: { userId },
      update: {
        secret,
        isEnabled: false,
      },
      create: {
        userId,
        secret,
        isEnabled: false,
      },
    });
  },
  enableById: async (id: string) => {
    return await prisma.twoFactorAuth.update({
      where: { id },
      data: { isEnabled: true },
    });
  },
};

export default TwoFactorAuthModel;
