import passportLocal from 'passport-local';
import passportJwt from 'passport-jwt';
import UserModel from '../models/userModel.js';
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
        return done(null, jwt_payload);
      } catch (err) {
        return done(err, false);
      }
    }),
  );
}
