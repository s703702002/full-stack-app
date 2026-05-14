import prisma from '../config/db';

const TwoFactorAuthModel = {
  findByUserId: async (userId) => {
    return await prisma.twoFactorAuth.findUnique({
      where: { userId },
    });
  },
  upsertTwoFactorAuth: async (userId, secret) => {
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
  enableById: async (id) => {
    return await prisma.twoFactorAuth.update({
      where: { id },
      data: { isEnabled: true },
    });
  },
};

export default TwoFactorAuthModel;
