import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redisClient from '../config/redis.js';
import { PREFIX } from '../constants/redisKeys.js';

const createRedisStore = (prefixName: string) => {
  return new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: prefixName,
  });
};

// 針對「高風險操作 (登入、註冊、忘記密碼)」的嚴格限流
export const authLimiter = rateLimit({
  store: createRedisStore(PREFIX.RATE_LIMIT_AUTH),
  windowMs: 15 * 60 * 1000, // 時間窗口：15 分鐘
  max: 10, // 在這 15 分鐘內，同一個 IP 最多只能請求 5 次
  standardHeaders: true, // 回傳標準的 RateLimit header 資訊在 Response 裡
  legacyHeaders: false, // 停用舊版的 X-RateLimit header
  message: { success: false, message: '嘗試次數過多，請於 15 分鐘後再試。' },
});

// 針對「一般 API」的寬鬆限流 (選用，保護伺服器不被 DDoS)
export const apiLimiter = rateLimit({
  store: createRedisStore(PREFIX.RATE_LIMIT_API),
  windowMs: 1 * 60 * 1000, // 1 分鐘
  max: 100, // 每分鐘最多 100 次
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: '請求頻率過高，請稍後再試。' },
});

export const accountAuthLimiter = rateLimit({
  store: createRedisStore(PREFIX.RATE_LIMIT_ACCOUNT),
  windowMs: 30 * 60 * 1000, // 帳號鎖定時間通常比較長，例如 30 分鐘
  max: 5, // 密碼連續錯 5 次就鎖定該帳號

  // 告訴 Limiter，不要用 IP 記名，用「輸入的帳號」記名
  keyGenerator: (req, _res) => {
    return req.body.username || 'unknown_user';
  },

  // 只有「登入失敗」才計數！
  // (依賴你的 authController 登入失敗時會回傳 401 狀態碼)
  skipSuccessfulRequests: true,

  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      '該帳號密碼錯誤次數過多。為保護帳號安全，請於 30 分鐘後再試，或使用忘記密碼功能。',
  },
});
