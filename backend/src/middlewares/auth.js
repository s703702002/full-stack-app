import AppError from '../utils/AppError.js';

export const checkAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) throw new AppError('請先登入', 401);

  return next();
};
