import UserModel from '../models/userModel.js';
import redisClient from '../config/redis.js';
import {
  getAccountRateLimitKey,
  getRefreshTokenKey,
} from '../constants/redisKeys.js';
import AppError from '../utils/AppError.js';
import {
  signAccessToken,
  signRefreshToken,
  signTempToken,
  verifyRefreshToken,
  verifyTempToken,
} from '../utils/jwtHelper.js';
import { hashString } from '../utils/hashHelper.js';
import { generateRandomToken } from '../utils/cryptoHelper.js';
import { generate2FA, otpVerify } from '../utils/twoFAHelper.js';

export const generate2FAToken = (user) => {
  const tempToken = signTempToken({ id: user.id, purpose: '2fa' });
  return tempToken;
};

export const generateAuthTokens = async (user) => {
  const accessToken = signAccessToken({
    id: user.id,
    username: user.username,
    roleId: user.roleId,
    roleName: user.role?.name,
  });

  const refreshToken = signRefreshToken({ id: user.id });

  const redisKey = getRefreshTokenKey(user.id);
  await redisClient.setEx(redisKey, 7 * 24 * 60 * 60, refreshToken);

  return { accessToken, refreshToken };
};

export const registerUser = async (username, password, name) => {
  const userExists = await UserModel.findByUsername(username);
  if (userExists) throw new AppError('這個帳號已經被註冊過了', 409);

  const role = await UserModel.findRoleByName('viewer');
  if (!role) throw new AppError('系統錯誤：找不到預設角色', 500);

  const hashedPassword = await hashString(password, 10);
  return await UserModel.createUser({
    username,
    password: hashedPassword,
    name,
    roleId: role.id,
  });
};

export const verify2FALogin = async (tempToken, totpCode) => {
  const decoded = verifyTempToken(tempToken);
  if (decoded.purpose !== '2fa') throw new AppError('無效的憑證類型', 403);

  const user = await UserModel.findById(decoded.id, true);
  if (!user) throw new AppError('找不到該使用者', 401);

  await otpVerify({ token: totpCode, secret: user.twoFactorSecret });
  return user;
};

export const logoutUser = async (userId) => {
  const redisKey = getRefreshTokenKey(userId);
  await redisClient.del(redisKey);
};

export const refreshAccessToken = async (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);
  const redisKey = getRefreshTokenKey(decoded.id);
  const storedToken = await redisClient.get(redisKey);

  if (!storedToken || storedToken !== refreshToken) {
    throw new AppError('Refresh Token 無效或已被撤銷，請重新登入', 403);
  }

  const user = await UserModel.findById(decoded.id, true);
  if (!user) throw new AppError('帳號不存在', 403);

  return signAccessToken({
    id: user.id,
    username: user.username,
    roleId: user.roleId,
    roleName: user.role?.name,
  });
};

export const processForgotPassword = async (username) => {
  const user = await UserModel.findByUsername(username);

  // 💡 為了防範帳號枚舉攻擊，就算找不到帳號也不 throw error，直接 return 讓流程結束
  if (!user) return;

  const resetToken = generateRandomToken();
  const resetExpires = new Date(Date.now() + 3600000);

  await UserModel.updateUser(user.id, {
    resetToken,
    resetTokenExpires: resetExpires,
  });

  console.log(
    `\n✉️ [系統通知信] 請點擊重設密碼: http://localhost:5173/reset-password/${resetToken}\n`,
  );
};

export const processResetPassword = async (token, newPassword) => {
  const user = await UserModel.findByValidResetToken(token);
  if (!user) throw new AppError('連結無效或已過期', 400);

  const hashedPassword = await hashString(newPassword, 10);
  await UserModel.resetPassword(user.id, hashedPassword);

  const redisKey = getAccountRateLimitKey(user.username);
  await redisClient.del(redisKey);
};

export const setupUser2FA = async (userId, username) => {
  const { secret, qrCodeImage } = await generate2FA(username);
  await UserModel.updateUser(userId, { twoFactorSecret: secret });
  return { secret, qrCodeImage };
};

export const verifyAndEnable2FA = async (userId, totpCode) => {
  const user = await UserModel.findById(userId);
  if (!user?.twoFactorSecret) {
    throw new AppError('尚未產生 2FA 金鑰，請先執行 setup', 400);
  }

  await otpVerify({ token: totpCode, secret: user.twoFactorSecret });
  await UserModel.updateUser(userId, { isTwoFactorEnabled: true });
};
