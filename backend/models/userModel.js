import prisma from '../config/db.js';

const UserModel = {
  findByUsername: async (username) => {
    return await prisma.user.findUnique({
      where: { username },
      include: { role: true },
    });
  },

  findById: async (id) => {
    return await prisma.user.findUnique({
      where: { id },
    });
  },

  findByIdWithRole: async (id) => {
    return await prisma.user.findUnique({
      where: { id: Number(id) },
      include: { role: true },
    });
  },

  findAllWithRole: async () => {
    return await prisma.user.findMany({
      include: { role: true },
      orderBy: { id: 'asc' },
    });
  },

  findRoleByName: async (roleName) => {
    return await prisma.role.findUnique({
      where: { name: roleName },
    });
  },

  // 驗證權限：檢查該用戶的角色是否有某個權限
  hasPermission: async (userId, permissionName) => {
    const count = await prisma.rolePermission.count({
      where: {
        role: {
          users: { some: { id: userId } },
        },
        permission: { name: permissionName },
      },
    });
    return count > 0;
  },

  updateRole: async (userId, newRoleName) => {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        role: { connect: { name: newRoleName } },
      },
    });
  },

  updateRoleId: async (userId, roleId) => {
    return await prisma.user.update({
      where: { id: Number(userId) },
      data: { roleId: Number(roleId) },
    });
  },

  createUser: async (username, hashedPassword, name, roleId) => {
    return await prisma.user.create({
      data: { username, password: hashedPassword, name, roleId },
    });
  },

  updateResetToken: async (userId, token, expiryDate) => {
    return await prisma.user.update({
      where: { id: userId },
      data: { resetToken: token, resetTokenExpires: expiryDate },
    });
  },

  updateProfile: async (userId, updateData) => {
    return await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  },

  findByValidResetToken: async (token) => {
    return await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() }, // gt 代表 greater than (大於現在時間)
      },
    });
  },

  resetPassword: async (userId, newHashedPassword) => {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        password: newHashedPassword,
        resetToken: null,
        resetTokenExpires: null,
        twoFactorSecret: null,
        isTwoFactorEnabled: false,
      },
    });
  },

  save2FASecret: async (userId, secret) => {
    return await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });
  },

  enable2FA: async (userId) => {
    return await prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: true },
    });
  },
};

export default UserModel;
