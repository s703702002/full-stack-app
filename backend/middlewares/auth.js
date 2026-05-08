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
      return next(new AppError(info?.message || '請先登入', 401));
    }

    const userPermissions =
      user.role?.permissions?.map((p) => p.permission.name) || [];

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role?.name,
      permissions: userPermissions,
    };

    next();
  })(req, res, next);
};
