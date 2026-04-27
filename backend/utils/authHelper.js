import { getRefreshTokenKey } from '../constants/redisKeys.js';
import { sanitizeUser } from './formatters.js';
import redisClient from '../config/redis.js';
import { sendSuccess } from './response.js';
import {
  signTempToken,
  signAccessToken,
  signRefreshToken,
} from './jwtHelper.js';
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setTempTokenCookie,
  clearTempTokenCookie,
} from './cookieHelper.js';

/**
 * 處理 2FA 攔截，發放暫時性 Token
 */
export const handle2FAIntercept = (res, user) => {
  const tempToken = signTempToken({ id: user.id, purpose: '2fa' });

  setTempTokenCookie(res, tempToken);

  return sendSuccess(
    res,
    200,
    { tempToken, require2FA: true },
    '請輸入 2FA 驗證碼',
  );
};

/**
 * 統一處理登入成功後的發放憑證與回應邏輯
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Object} user - 資料庫撈出來的完整使用者物件
 */
export const handleLoginSuccess = async (req, res, user) => {
  const cleanUser = sanitizeUser(user);

  const accessToken = signAccessToken({
    id: user.id,
    username: user.username,
    roleId: user.roleId,
    roleName: user.role?.name,
  });
  const refreshToken = signRefreshToken({ id: user.id });

  const redisKey = getRefreshTokenKey(user.id);
  await redisClient.setEx(redisKey, 7 * 24 * 60 * 60, refreshToken);

  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, refreshToken);
  clearTempTokenCookie(res);

  return sendSuccess(res, 200, { user: cleanUser }, '登入成功');
};
