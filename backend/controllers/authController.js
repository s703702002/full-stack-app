import passport from 'passport';

import UserModel from '../models/userModel.js';
import redisClient from '../config/redis.js';
import {
  getAccountRateLimitKey,
  getRefreshTokenKey,
} from '../constants/redisKeys.js';
import { handle2FAIntercept, handleLoginSuccess } from '../utils/authHelper.js';
import { sanitizeUser } from '../utils/formatters.js';
import { sendSuccess } from '../utils/response.js';
import AppError from '../utils/AppError.js';
import {
  signAccessToken,
  verifyRefreshToken,
  verifyTempToken,
} from '../utils/jwtHelper.js';
import { hashString } from '../utils/hashHelper.js';
import { generateRandomToken } from '../utils/cryptoHelper.js';
import { generate2FA, otpVerify } from '../utils/twoFAHelper.js';
import {
  setAccessTokenCookie,
  clearAllAuthCookies,
  getRefreshToken,
  getTempToken,
} from '../utils/cookieHelper.js';

export const register = async (req, res) => {
  const { username, password, name } = req.body;

  const userExists = await UserModel.findByUsername(username);
  if (userExists) {
    throw new AppError('這個帳號已經被註冊過了', 409);
  }

  const role = await UserModel.findRoleByName('viewer');
  if (!role) {
    throw new AppError('系統錯誤：找不到預設角色', 500);
  }

  const hashedPassword = await hashString(password, 10);
  const newUser = await UserModel.createUser(
    username,
    hashedPassword,
    name,
    role.id,
  );

  sendSuccess(res, 201, { user: sanitizeUser(newUser) }, '註冊成功');
};

export const login = (req, res, next) => {
  passport.authenticate(
    'local',
    { session: false },
    async (err, user, info) => {
      try {
        if (err) throw new AppError('伺服器內部錯誤', 500);
        if (!user) throw new AppError(info?.message || '登入失敗', 401);

        if (user.isTwoFactorEnabled && !user._skip2FA) {
          return handle2FAIntercept(res, user);
        }

        return await handleLoginSuccess(req, res, user);
      } catch (error) {
        next(error);
      }
    },
  )(req, res, next);
};

export const login2FA = async (req, res) => {
  const { totpCode } = req.body;
  const tempToken = getTempToken(req);

  if (!tempToken) {
    throw new AppError('缺少驗證資訊', 400);
  }

  const decoded = verifyTempToken(tempToken);

  if (decoded.purpose !== '2fa') {
    throw new AppError('無效的憑證類型', 403);
  }

  const user = await UserModel.findByIdWithRole(decoded.id);
  if (!user) {
    throw new AppError('找不到該使用者', 401);
  }

  await otpVerify({ token: totpCode, secret: user.twoFactorSecret });

  return await handleLoginSuccess(req, res, user);
};

export const logout = async (req, res) => {
  const redisKey = getRefreshTokenKey(req.user.id);
  await redisClient.del(redisKey);

  clearAllAuthCookies(res);

  sendSuccess(res, 200, {}, '登出成功');
};

export const refreshToken = async (req, res) => {
  const refreshToken = getRefreshToken(req);

  if (!refreshToken) {
    throw new AppError('未提供 Refresh Token', 401);
  }

  const decoded = verifyRefreshToken(refreshToken);
  const redisKey = getRefreshTokenKey(decoded.id);
  const storedToken = await redisClient.get(redisKey);

  if (!storedToken || storedToken !== refreshToken) {
    throw new AppError('Refresh Token 無效或已被撤銷，請重新登入', 403);
  }

  const user = await UserModel.findByIdWithRole(decoded.id);
  if (!user) {
    throw new AppError('帳號不存在', 403);
  }

  const newAccessToken = signAccessToken({
    id: user.id,
    username: user.username,
    roleId: user.roleId,
    roleName: user.role?.name,
  });

  setAccessTokenCookie(res, newAccessToken);

  sendSuccess(res, 200, {});
};

export const forgotPassword = async (req, res) => {
  const { username } = req.body;

  const user = await UserModel.findByUsername(username);
  if (!user) {
    // 為了防範帳號枚舉攻擊 (User Enumeration)，就算找不到帳號也顯示寄出成功
    return sendSuccess(res, 200, {}, '若帳號存在，重設密碼的連結已寄出');
  }

  const resetToken = generateRandomToken();
  const resetExpires = new Date(Date.now() + 3600000); // 💡 Prisma 需要 Date 物件

  await UserModel.updateResetToken(user.id, resetToken, resetExpires);

  console.log(
    `\n✉️ [系統通知信] 請點擊連結重設密碼: http://localhost:5173/reset-password/${resetToken}\n`,
  );

  sendSuccess(res, 200, {}, '重設密碼的連結已寄出 (請查看終端機)');
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const user = await UserModel.findByValidResetToken(token);
  if (!user) {
    throw new AppError('連結無效或已過期', 400);
  }

  const hashedPassword = await hashString(newPassword, 10);
  await UserModel.resetPassword(user.id, hashedPassword);

  const redisKey = getAccountRateLimitKey(user.username);
  await redisClient.del(redisKey);

  sendSuccess(res, 200, {}, '密碼重設成功，請使用新密碼登入！');
};

export const setup2FA = async (req, res) => {
  const userId = req.user.id;
  const userEmailOrName = req.user.username;
  const { secret, qrCodeImage } = await generate2FA(userEmailOrName);
  await UserModel.save2FASecret(userId, secret);
  sendSuccess(res, 200, { qrCodeImage, secret });
};

export const verify2FA = async (req, res) => {
  const userId = req.user.id;
  const { token } = req.body;

  const user = await UserModel.findById(userId);

  if (!user?.twoFactorSecret) {
    throw new AppError('尚未產生 2FA 金鑰，請先執行 setup', 400);
  }

  await otpVerify({ token: token, secret: user.twoFactorSecret });

  await UserModel.enable2FA(userId);
  sendSuccess(res, 200, {}, '2FA 雙重驗證已成功啟用！');
};
