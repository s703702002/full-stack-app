import prisma from '../config/db.js';
import type { Prisma } from '../generated/client.js';

type CreateUserInput = Pick<
  Prisma.UserUncheckedCreateInput,
  'username' | 'password' | 'name' | 'email' | 'roleId'
>;

type CreateUserWithOAuthInput = Pick<
  Prisma.UserUncheckedCreateInput,
  'email' | 'name' | 'username' | 'roleId'
>;

type OAuthProviderInput = Pick<
  Prisma.OAuthAccountCreateInput,
  'provider' | 'providerId'
>;

// ── Include 選項型別 ───────────────────────────────────────────
interface IncludeOptions {
  role?: boolean;
  twoFactorAuth?: boolean;
  oauthAccounts?: boolean;
}

const buildInclude = (options: IncludeOptions): Prisma.UserInclude => {
  return {
    role: !!options.role,
    twoFactorAuth: !!options.twoFactorAuth,
    oauthAccounts: !!options.oauthAccounts,
  };
};

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
    ]);
  },
};

export default UserModel;
