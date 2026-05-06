import passport from 'passport';
import AppError from '../utils/AppError.js';

export const checkAuthenticated = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      if (info?.name === 'TokenExpiredError') {
        return next(
          new AppError('登入憑證已過期，請重新登入', 401, 'TOKEN_EXPIRED'),
        );
      }

      return next(new AppError(info?.message || '權限不足或未登入', 401));
    }

    req.user = user;
    next();
  })(req, res, next);
};
