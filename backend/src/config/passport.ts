import passportLocal from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import type { PassportStatic } from 'passport';
import UserModel from '../models/userModel.js';
import RoleModel from '../models/roleModel.js';
import { compareHash } from '../utils/hashHelper.js';
import PermissionModel from '../models/permissionModel.js';
import OAuthAccountModel from '../models/OAuthAccountModel.js';
import { parseDevUsername } from '../utils/devBackdoor.js';
import { env } from '../utils/validateEnv.js';
import type { AuthUser } from '../types/auth.js';

const { Strategy: LocalStrategy } = passportLocal;

const toPassportUser = (user: object) =>
  ({ ...user, permissions: [] }) as unknown as AuthUser;

export default function setupPassport(passport: PassportStatic): void {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await UserModel.findById(id);
      if (!user) return done(null, false);

      const permissions = await PermissionModel.getByRoleId(user.roleId);

      const userWithPermissions: AuthUser = {
        ...user,
        permissions: permissions.map((p) => p.name),
      };

      done(null, userWithPermissions);
    } catch (err) {
      done(err);
    }
  });

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const { queryUsername, skip2FA } = parseDevUsername(username);

        const user = await UserModel.findByUsername(queryUsername, {
          twoFactorAuth: true,
        });
        if (!user) return done(null, false, { message: '帳號不存在' });

        if (!user.password)
          return done(null, false, { message: '此帳號使用第三方登入' });

        const isMatch = await compareHash(password, user.password);
        if (!isMatch) return done(null, false, { message: '密碼錯誤' });

        // _skip2FA 不在 Prisma schema 上，用 unknown 轉型擴充
        const userWithFlag = user as typeof user & { _skip2FA?: boolean };
        if (skip2FA) userWithFlag._skip2FA = true;

        return done(null, toPassportUser(userWithFlag));
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value;

          if (!email) return done(new Error('Google 帳號沒有 email'));

          let user = await OAuthAccountModel.findByGoogleId(googleId);
          if (user) return done(null, toPassportUser(user));

          user = await UserModel.findByEmail(email);

          if (user) {
            await OAuthAccountModel.createOauthAccount({
              userId: user.id,
              provider: 'google',
              providerId: googleId,
            });
            return done(null, toPassportUser(user));
          }

          const defaultRole = await RoleModel.findByName('viewer');
          if (!defaultRole) return done(new Error('找不到預設角色'));

          const newUser = await UserModel.createUserWithOAuth(
            {
              email,
              name: profile.displayName,
              username: `google_${googleId}`,
              roleId: defaultRole.id,
            },
            { provider: 'google', providerId: googleId },
          );

          return done(null, toPassportUser(newUser));
        } catch (error) {
          return done(error as Error);
        }
      },
    ),
  );
}
