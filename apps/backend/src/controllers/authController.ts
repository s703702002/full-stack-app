import passport from 'passport';
import type { Request, Response, NextFunction } from 'express';
import * as AuthService from '../services/authService.js';
import { sanitizeUser } from '../utils/formatters.js';
import { sendSuccess } from '../utils/response.js';
import AppError from '../utils/AppError.js';
import { clearAllAuthCookies } from '../utils/cookieHelper.js';
import { toPassportUser } from '../config/passport.js';
import { getAuthUser } from '../utils/requestHelper.js';
import type {
  PassportLocalCallback,
  PassportGoogleCallback,
} from '../types/passport.js';
import logger from '../utils/logger.js';
import type {
  AuthResponseDTO,
  UserDTO,
  TwoFAInfoDTO,
} from '@full-stack-app/shared';
import {
  Login2FABody,
  RegisterBody,
  Verify2FABody,
} from '../validators/authValidator.js';

export const register = async (req: Request, res: Response) => {
  const { username, password, name } = req.body as RegisterBody;
  const newUser = await AuthService.registerUser(username, password, name);

  sendSuccess<{ user: UserDTO | null }>(
    res,
    201,
    { user: sanitizeUser(newUser) },
    '註冊成功',
  );
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  const localAuthCallback: PassportLocalCallback = async (err, user, info) => {
    if (err) return next(err);
    if (!user) return next(new AppError(info?.message || '登入失敗', 401));

    if (user.twoFactorAuth?.isEnabled && !user._skip2FA) {
      req.session.tempUserId = user.id;

      return req.session.save((err) => {
        if (err) return next(err);
        return sendSuccess<AuthResponseDTO>(
          res,
          200,
          { require2FA: true },
          '請輸入 2FA 驗證碼',
        );
      });
    }

    req.login(user, (err) => {
      if (err) return next(err);
      return sendSuccess<AuthResponseDTO>(
        res,
        200,
        { user: sanitizeUser(user) || undefined },
        '登入成功',
      );
    });
  };

  passport.authenticate('local', localAuthCallback)(req, res, next);
};

export const login2FA = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { totpCode } = req.body as Login2FABody;

  const tempUserId = req.session.tempUserId;
  if (!tempUserId) throw new AppError('缺少驗證資訊或驗證時效已過', 400);

  const user = await AuthService.verify2FALogin(tempUserId, totpCode);

  req.login(toPassportUser(user), (err) => {
    if (err) return next(err);
    delete req.session.tempUserId;
    sendSuccess<AuthResponseDTO>(
      res,
      200,
      { user: sanitizeUser(user) || undefined },
      '登入成功',
    );
  });
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      clearAllAuthCookies(res);
      sendSuccess(res, 200, {}, '登出成功');
    });
  });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { username } = req.body as { username: string };
  await AuthService.processForgotPassword(username);
  sendSuccess(res, 200, {}, '若帳號存在，重設密碼的連結已寄出');
};

export const resetPassword = async (
  req: Request<{ token: string }, unknown, { newPassword: string }>,
  res: Response,
) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  await AuthService.processResetPassword(token, newPassword);
  sendSuccess(res, 200, {}, '密碼重設成功，請使用新密碼登入！');
};

export const setup2FA = async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { secret, qrCodeImage } = await AuthService.setupUser2FA(
    user.id,
    user.username,
  );
  sendSuccess<TwoFAInfoDTO>(res, 200, { qrCodeImage, secret });
};

export const verify2FA = async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { token } = req.body as Verify2FABody;
  await AuthService.verifyAndEnable2FA(user.id, token);
  sendSuccess(res, 200, {}, '2FA 雙重驗證已成功啟用！');
};

export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

export const googleCallback = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const googleAuthCallback: PassportGoogleCallback = async (err, user) => {
    if (err || !user) {
      logger.error(err, '🚨 [Google OAuth 系統錯誤]:');
      return res.redirect(
        'http://localhost:5173/login?error=google_login_failed',
      );
    }

    req.login(user, (err) => {
      if (err) return next(err);
      return res.redirect('http://localhost:5173/profile');
    });
  };

  passport.authenticate('google', googleAuthCallback)(req, res, next);
};
