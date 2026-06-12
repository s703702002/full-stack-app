import crypto from 'node:crypto';

/**
 * 產生隨機的 Hex 字串 (用於重設密碼 Token)
 * @param {number} bytes - 長度
 */
export const generateRandomToken = (bytes = 20) => {
  return crypto.randomBytes(bytes).toString('hex');
};
