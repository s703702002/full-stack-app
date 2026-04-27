import { generateSecret, verify, generateURI } from 'otplib';
import qrcode from 'qrcode';
import AppError from './AppError.js';

/**
 * 產生 2FA 密鑰與 QR Code
 */
export const generate2FA = async (label, issuer = 'MissionApp') => {
  const secret = generateSecret();
  const otpauthUrl = generateURI({ issuer, label, secret });
  const qrCodeImage = await qrcode.toDataURL(otpauthUrl);

  return { secret, qrCodeImage };
};

/**
 * 驗證 2FA Token
 */
export const otpVerify = async ({ token, secret }) => {
  console.log('--- 2FA 抓漏雷達 ---');
  console.log(
    `1. Token (長度/型別): "${token}" (${token?.length}碼 / ${typeof token})`,
  );
  console.log(`2. Secret: "${secret}"`);
  console.log(`3. Server 秒數: ${new Date().getSeconds()}`);
  console.log(`4. Server 完整時間: ${new Date().toISOString()}`);
  console.log('--------------------');

  const verificationResult = await verify({ token, secret });
  const isValid =
    typeof verificationResult === 'boolean'
      ? verificationResult
      : verificationResult?.valid;

  if (!isValid) {
    throw new AppError('驗證碼錯誤或已過期', 401);
  }
};
