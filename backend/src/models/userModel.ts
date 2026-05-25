import prisma from '../config/db.js';
import type { Prisma } from '../generated/client.js';

// ── Include 選項型別 ───────────────────────────────────────────
interface IncludeOptions {
  role?: boolean;
  twoFactorAuth?: boolean;
  oauthAccounts?: boolean;
}

const buildInclude = <T extends IncludeOptions>(
  options: T,
): Prisma.UserInclude => {
  const include: Prisma.UserInclude = {
    role: false,
    twoFactorAuth: false,
    oauthAccounts: false,
  };
  if (options.role) include.role = true;
  if (options.twoFactorAuth) include.twoFactorAuth = true;
  if (options.oauthAccounts) include.oauthAccounts = true;
  return include;
};

// ── createUser 參數型別 ────────────────────────────────────────
interface CreateUserInput {
  username: string;
  password: string;
  name: string;
  roleId: number;
  email?: string;
}

interface CreateUserWithOAuthInput {
  email: string;
  name: string;
  username: string;
  roleId: number;
}

interface OAuthProviderInput {
  provider: string;
  providerId: string;
}

const UserModel = {
  findByUsername: async (username: string, options: IncludeOptions = {}) => {
    return await prisma.user.findUnique({
      where: { username },
      include: buildInclude(options),
    });
  },

  findById: async (id: string, options: IncludeOptions = {}) => {
    return await prisma.user.findUnique({
      where: { id },
      include: buildInclude(options),
    });
  },

  findByEmail: async (email: string, options: IncludeOptions = {}) => {
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

  findByValidResetToken: async (token: string) => {
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
    return resetToken?.user ?? null;
  },

  updateUser: async (userId: string, data: Prisma.UserUncheckedUpdateInput) => {
    return await prisma.user.update({
      where: { id: userId },
      data,
    });
  },

  createUser: async ({
    username,
    password,
    name,
    roleId,
    email,
  }: CreateUserInput) => {
    return await prisma.user.create({
      data: { username, password, name, roleId, email },
    });
  },

  createUserWithOAuth: async (
    { email, name, username, roleId }: CreateUserWithOAuthInput,
    { provider, providerId }: OAuthProviderInput,
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

  resetPassword: async (userId: string, newHashedPassword: string) => {
    return await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { password: newHashedPassword },
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
