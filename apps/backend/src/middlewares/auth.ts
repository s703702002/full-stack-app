import type { Request, Response, NextFunction } from 'express';
import * as UserBanModel from '../models/userBanModel.js';
import AppError from '../utils/AppError.js';
import { getAuthUser } from '../utils/requestHelper.js';

export const checkAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.isAuthenticated()) throw new AppError('請先登入', 401);

  const user = getAuthUser(req);
  const ban = await UserBanModel.findActiveBan(user.id);
  if (ban) {
    throw new AppError(`此帳號已被停用`, 403, {
      errorCode: 40301,
      reason: ban.reason,
      expiresAt: ban.expiresAt,
    });
  }

  return next();
};
