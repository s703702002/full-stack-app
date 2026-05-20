import passportLocal from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import UserModel from '../models/userModel.js';
import RoleModel from '../models/roleModel.js';
import { compareHash } from '../utils/hashHelper.js';
import PermissionModel from '../models/permissionModel.js';
import OAuthAccountModel from '../models/OAuthAccountModel.js';
import { parseDevUsername } from '../utils/devBackdoor.js';

const { Strategy: LocalStrategy } = passportLocal;

export default function setupPassport(passport) {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await UserModel.findById(id);
      if (!user) return done(null, false);

      const permissions = await PermissionModel.getByRoleId(user.roleId);

      const userWithPermissions = {
        ...user,
        permissions: permissions.map((p) => p.name) || [],
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

        const isMatch = await compareHash(password, user.password);
        if (!isMatch) return done(null, false, { message: '密碼錯誤' });

        if (skip2FA) user._skip2FA = true;

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email = profile.emails[0].value;

          // 先用 googleId 找 OAuthAccount
          let user = await OAuthAccountModel.findByGoogleId(googleId);
          if (user) return done(null, user);

          // 如果沒找到，看看他的 Email 是不是以前用帳密註冊過
          user = await UserModel.findByEmail(email);

          if (user) {
            // 曾經用帳密註冊過，幫他建立 OAuthAccount 綁定
            await OAuthAccountModel.createOauthAccount({
              userId: user.id,
              provider: 'google',
              providerId: googleId,
            });
            return done(null, user);
          }

          // 真的完全沒註冊過，直接幫他建立一個新帳號！
          const defaultRole = await RoleModel.findByName('viewer');
          const newUser = await UserModel.createUserWithOAuth(
            {
              email,
              name: profile.displayName,
              username: `google_${googleId}`,
              roleId: defaultRole.id,
            },
            { provider: 'google', providerId: googleId },
          );

          return done(null, newUser);
        } catch (error) {
          return done(error, null);
        }
      },
    ),
  );
}
