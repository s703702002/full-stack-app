import prisma from '../config/db.js';

const UserModel = {
  // ==========================================
  // 🔍 1. 查詢類 (Read)
  // ==========================================

  findByUsername: async (username, includeRole = false) => {
    return await prisma.user.findUnique({
      where: { username },
      include: includeRole ? { role: true } : undefined,
    });
  },

  findById: async (id, includeRole = false) => {
    return await prisma.user.findUnique({
      where: { id: Number(id) },
      include: includeRole ? { role: true } : undefined,
    });
  },

  findByEmail: async (email, includeRole = false) => {
    return await prisma.user.findUnique({
      where: { email: email },
      include: includeRole ? { role: true } : undefined,
    });
  },

  findByGoogleId: async (id, includeRole = false) => {
    return await prisma.user.findUnique({
      where: { googleId: id },
      include: includeRole ? { role: true } : undefined,
    });
  },

  findAllWithRole: async () => {
    return await prisma.user.findMany({
      include: { role: true },
      orderBy: { id: 'asc' },
    });
  },

  findByValidResetToken: async (token) => {
    return await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() },
      },
    });
  },

  // ==========================================
  // 🛠️ 2. 通用資料更新 (Generic Update)
  // ==========================================

  /**
   * 更新使用者資料
   * @param {number | string} userId - 使用者 ID
   * @param {Prisma.UserUpdateInput} data - Prisma 嚴格把關的更新資料格式
   */
  updateUser: async (userId, data) => {
    return await prisma.user.update({
      where: { id: Number(userId) },
      data,
    });
  },

  // ==========================================
  // 🧠 3. 核心商業邏輯 (Business Logic & Side-effects)
  // ==========================================

  createUser: async ({ username, password, name, roleId, googleId, email }) => {
    return await prisma.user.create({
      data: {
        username,
        password,
        name,
        roleId: Number(roleId),
        googleId,
        email,
      },
    });
  },

  // 因為重設密碼伴隨清除 2FA 與 Token 等多個副作用，必須獨立封裝防呆
  resetPassword: async (userId, newHashedPassword) => {
    return await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        password: newHashedPassword,
        resetToken: null,
        resetTokenExpires: null,
        twoFactorSecret: null,
        isTwoFactorEnabled: false,
      },
    });
  },
};

export default UserModel;
