import prisma from '../config/db.js';

const OAuthAccountModel = {
  findByGoogleId: async (googleId) => {
    const oauth = await prisma.oAuthAccount.findUnique({
      where: {
        provider_providerId: {
          // @@unique([provider, providerId])
          provider: 'google',
          providerId: googleId,
        },
      },
      include: { user: true },
    });
    return oauth?.user ?? null;
  },

  createOauthAccount: async (data) => {
    return await prisma.oAuthAccount.create({
      data: data,
    });
  },
};

export default OAuthAccountModel;
