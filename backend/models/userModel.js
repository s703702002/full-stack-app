import prisma from '../config/db.js';

const DEFAULT_INCLUDE = {
  role: false,
  twoFactorAuth: false,
  oauthAccounts: false,
};

const buildInclude = (options = {}) => {
  const opts = { ...DEFAULT_INCLUDE, ...options };
  const include = {};

  if (opts.role) include.role = true;
  if (opts.twoFactorAuth) include.twoFactorAuth = true;
  if (opts.oauthAccounts) include.oauthAccounts = true;

  return Object.keys(include).length > 0 ? include : undefined;
};

const UserModel = {
  // ==========================================
  // 查詢類 (Read)
  // ==========================================

  findByUsername: async (username, options = {}) => {
    return await prisma.user.findUnique({
      where: { username },
      include: buildInclude(options),
    });
  },

  findById: async (id, options = {}) => {
    return await prisma.user.findUnique({
      where: { id },
      include: buildInclude(options),
    });
  },

  findByEmail: async (email, options = {}) => {
    return await prisma.user.findUnique({
      where: { email },
      include: buildInclude(options),
    });
  },

  findAllWithRole: async () => {
    return await prisma.user.findMany({
      include: { role: true },
      orderBy: { id: 'asc' },
    });
  },

  findByValidResetToken: async (token) => {
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
    return resetToken?.user ?? null;
  },

  // ==========================================
  // 通用資料更新 (Generic Update)
  // ==========================================

  updateUser: async (userId, data) => {
    return await prisma.user.update({
      where: { id: userId },
      data,
    });
  },

  // ==========================================
  // 核心商業邏輯 (Business Logic & Side-effects)
  // ==========================================

  createUser: async ({ username, password, name, roleId, email }) => {
    return await prisma.user.create({
      data: {
        username,
        password,
        name,
        roleId,
        email,
      },
    });
  },

  createUserWithOAuth: async (
    { email, name, username, roleId },
    { provider, providerId },
  ) => {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, name, username, roleId },
      });
      await tx.oAuthAccount.create({
        data: { userId: user.id, provider, providerId },
      });
      return user;
    });
  },

  resetPassword: async (userId, newHashedPassword) => {
    return await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          password: newHashedPassword,
        },
      }),
      prisma.twoFactorAuth.deleteMany({
        where: { userId },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { userId },
      }),
    ]);
  },
};

export default UserModel;
