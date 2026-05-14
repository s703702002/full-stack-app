import prisma from '../config/db';

const PasswordResetTokenModel = {
  createResetToken: async (data) => {
    return await prisma.passwordResetToken.create({
      data,
    });
  },
  deleteByUserId: async (userId) => {
    return await prisma.passwordResetToken.deleteMany({
      where: { userId },
    });
  },
};

export default PasswordResetTokenModel;
