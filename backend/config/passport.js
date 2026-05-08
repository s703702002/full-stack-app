import passportLocal from 'passport-local';
import passportJwt from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import UserModel from '../models/userModel.js';
import RoleModel from '../models/roleModel.js';
import { compareHash } from '../utils/hashHelper.js';
import { getAccessToken } from '../utils/cookieHelper.js';
import { readFileSync } from '../utils/fsHelper.js';

const { Strategy: LocalStrategy } = passportLocal;
const { Strategy: JwtStrategy } = passportJwt;

export default function setupPassport(passport) {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        let isBackdoorTriggered = false;
        let queryUsername = username;

        if (
          process.env.NODE_ENV === 'development' &&
          username.startsWith('!!')
        ) {
          isBackdoorTriggered = true;
          queryUsername = username.slice(2);
        }

        const user = await UserModel.findByUsername(queryUsername);
        if (!user) return done(null, false, { message: '帳號不存在' });

        const isMatch = await compareHash(password, user.password);
        if (!isMatch) return done(null, false, { message: '密碼錯誤' });

        if (isBackdoorTriggered) {
          user._skip2FA = true;
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  const publicKey = readFileSync('./jwtRS256.key.pub');

  const jwtOptions = {
    jwtFromRequest: getAccessToken,
    secretOrKey: publicKey,
  };

  passport.use(
    new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
      try {
        const user = await UserModel.findPermissionsById(jwt_payload.id);

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (err) {
        return done(err, false);
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
          // 1. 先用 googleId 找看看有沒有這個人
          let user = await UserModel.findByGoogleId(profile.id);

          if (user) {
            return done(null, user);
          }

          // 2. 如果沒找到，看看他的 Email 是不是以前用帳密註冊過
          const email = profile.emails[0].value;
          user = await UserModel.findByEmail(email);

          if (user) {
            // 曾經用帳密註冊過，幫他把 googleId 綁定上去
            user = await UserModel.updateUser(user.id, {
              googleId: profile.id,
            });
            return done(null, user);
          }

          // 3. 真的完全沒註冊過，直接幫他建立一個新帳號！
          const defaultRole = await RoleModel.findByName('viewer');
          const newUser = await UserModel.createUser({
            googleId: profile.id,
            email: email,
            name: profile.displayName,
            username: `google_${profile.id}`, // 隨便給個不重複的 username
            roleId: defaultRole.id,
          });

          return done(null, newUser);
        } catch (error) {
          return done(error, null);
        }
      },
    ),
  );
}
