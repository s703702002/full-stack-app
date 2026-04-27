import bcrypt from 'bcrypt';

/**
 * 加密字串 (密碼)
 */
export const hashString = async (str, rounds = 10) => {
  return await bcrypt.hash(str, rounds);
};

/**
 * 比對明文與雜湊值是否相符
 */
export const compareHash = async (plainText, hashedText) => {
  return await bcrypt.compare(plainText, hashedText);
};
