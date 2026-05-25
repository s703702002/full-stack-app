import prisma from '../config/db.js';
import type { Prisma } from '../generated/client.js';

const OAuthAccountModel = {
  findByGoogleId: async (googleId: string) => {
    const oauth = await prisma.oAuthAccount.findUnique({
      where: {
        provider_providerId: {
          provider: 'google',
          providerId: googleId,
        },
      },
      include: { user: true },
    });
    return oauth?.user ?? null;
  },

  createOauthAccount: async (data: Prisma.OAuthAccountUncheckedCreateInput) => {
    return await prisma.oAuthAccount.create({ data });
  },
};

export default OAuthAccountModel;
