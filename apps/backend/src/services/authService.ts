import UserModel from '../models/userModel.js';
import redisClient from '../config/redis.js';
import {
  accountRateLimitKey,
  refreshTokenKey,
  resetPasswordKey,
} from '../constants/redisKeys.js';
import AppError from '../utils/AppError.js';
import { hashString } from '../utils/hashHelper.js';
import { generateRandomToken } from '../utils/cryptoHelper.js';
import { generate2FA, otpVerify } from '../utils/twoFAHelper.js';
import logger from '../utils/logger.js';
import RoleModel from '../models/roleModel.js';
import TwoFactorAuthModel from '../models/TwoFactorAuthMode.js';

export const registerUser = async (
  username: string,
  password: string,
  name: string,
) => {
  const userExists = await UserModel.findByUsername(username);
  if (userExists) throw new AppError('這個帳號已經被註冊過了', 409);

  const role = await RoleModel.findByName('viewer');
  if (!role) throw new AppError('系統錯誤：找不到預設角色', 500);

  const hashedPassword = await hashString(password, 10);
  return await UserModel.createUser({
    username,
    password: hashedPassword,
    name,
    roleId: role.id,
  });
};

export const verify2FALogin = async (tempUserId: string, totpCode: string) => {
  const user = await UserModel.findById(tempUserId, {
    role: true,
    twoFactorAuth: true,
  });
  if (!user) throw new AppError('找不到該使用者', 401);

  await otpVerify({
    token: totpCode,
    secret: user.twoFactorAuth?.secret ?? '',
  });
  return user;
};

export const logoutUser = async (userId: string): Promise<void> => {
  const redisKey = refreshTokenKey(userId);
  await redisClient.del(redisKey);
};

export const processForgotPassword = async (
  username: string,
): Promise<void> => {
  const user = await UserModel.findByUsername(username);
  if (!user) return;

  const resetToken = generateRandomToken();
  await redisClient.set(resetPasswordKey(resetToken), user.id, {
    expiration: {
      type: 'EX',
      value: 60 * 30, // 30 mins
    },
  });

  logger.info(
    { userId: user.id },
    `✉️ [系統通知信] 請點擊重設密碼: http://localhost:5173/reset-password/${resetToken}`,
  );
};

export const processResetPassword = async (
  token: string,
  newPassword: string,
): Promise<void> => {
  const userId = await redisClient.get(resetPasswordKey(token));
  if (!userId) throw new AppError('連結無效或已過期', 400);

  const user = await UserModel.findById(userId);
  if (!user) throw new AppError('找不到使用者', 404);

  const hashedPassword = await hashString(newPassword, 10);
  await UserModel.resetPassword(userId, hashedPassword);

  await redisClient.del(resetPasswordKey(token));
  await redisClient.del(accountRateLimitKey(user.username));
};

export const setupUser2FA = async (userId: string, username: string) => {
  const { secret, qrCodeImage } = await generate2FA(username);
  await TwoFactorAuthModel.upsertTwoFactorAuth(userId, secret);
  return { secret, qrCodeImage };
};

export const verifyAndEnable2FA = async (
  userId: string,
  totpCode: string,
): Promise<void> => {
  const twoFactorAuth = await TwoFactorAuthModel.findByUserId(userId);
  if (!twoFactorAuth) {
    throw new AppError('尚未產生 2FA 金鑰，請先執行 setup', 400);
  }

  const { secret, id } = twoFactorAuth;
  await otpVerify({ token: totpCode, secret });
  await TwoFactorAuthModel.enableById(id);
};
