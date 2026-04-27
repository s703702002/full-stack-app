import passport from 'passport';
import AppError from '../utils/AppError.js';

export const checkAuthenticated = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }

    //  驗證失敗 (沒帶 Token、Token 偽造、Token 過期)
    if (!user) {
      if (info?.name === 'TokenExpiredError') {
        return next(
          new AppError('登入憑證已過期，請重新登入', 401, 'TOKEN_EXPIRED'),
        );
      }

      const errorMessage = info?.message || '權限不足或未登入';
      return next(new AppError(errorMessage, 401));
    }

    req.user = user;
    next();
  })(req, res, next);
};
