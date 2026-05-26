import type { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError.js';

export const checkAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.isAuthenticated()) throw new AppError('請先登入', 401);

  return next();
};
