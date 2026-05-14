import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as AuthService from './authService.js';
import UserModel from '../models/userModel.js';
import RoleModel from '../models/roleModel.js';
import PasswordResetTokenModel from '../models/PasswordResetTokenModel.js';
import redisClient from '../config/redis.js';
import {
  getAccountRateLimitKey,
  getRefreshTokenKey,
} from '../constants/redisKeys.js';
import * as jwtHelper from '../utils/jwtHelper.js';
import * as hashHelper from '../utils/hashHelper.js';
import * as cryptoHelper from '../utils/cryptoHelper.js';
import * as twoFAHelper from '../utils/twoFAHelper.js';

vi.mock('../models/userModel.js');
vi.mock('../models/roleModel.js');
vi.mock('../models/PasswordResetTokenModel.js');

// 針對有 default export 的第三方或設定檔，安全起見手動 Mock 結構
vi.mock('../config/redis.js', () => ({
  default: { setEx: vi.fn(), get: vi.fn(), del: vi.fn() },
}));

vi.mock('../utils/logger.js', () => ({
  default: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

vi.mock('../utils/jwtHelper.js');
vi.mock('../utils/hashHelper.js');
vi.mock('../utils/cryptoHelper.js');
vi.mock('../utils/twoFAHelper.js');

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateAuthTokens', () => {
    it('應該要產生 Access/Refresh Token 並將 Refresh Token 存入 Redis', async () => {
      const mockUser = {
        id: '1',
        username: 'stanley',
        roleId: 2,
        role: { name: 'admin' },
      };
      jwtHelper.signAccessToken.mockReturnValue('mock-access-token');
      jwtHelper.signRefreshToken.mockReturnValue('mock-refresh-token');

      const tokens = await AuthService.generateAuthTokens(mockUser);

      expect(tokens).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
      expect(jwtHelper.signAccessToken).toHaveBeenCalledWith({
        id: '1',
        username: 'stanley',
        roleId: 2,
        roleName: 'admin',
      });
      // 驗證 Redis 儲存動作
      const expectedRedisKey = getRefreshTokenKey(1);
      expect(redisClient.setEx).toHaveBeenCalledWith(
        expectedRedisKey,
        7 * 24 * 60 * 60,
        'mock-refresh-token',
      );
    });
  });

  describe('registerUser', () => {
    it('帳號若已存在，應拋出 409 錯誤', async () => {
      UserModel.findByUsername.mockResolvedValue({ id: '1' }); // 模擬帳號已存在
      await expect(
        AuthService.registerUser('stanley', '123', 'Stan'),
      ).rejects.toThrow('這個帳號已經被註冊過了');
    });

    it('成功註冊，應該要 Hash 密碼並寫入資料庫', async () => {
      UserModel.findByUsername.mockResolvedValue(null);
      RoleModel.findByName.mockResolvedValue({ id: 99 });
      hashHelper.hashString.mockResolvedValue('hashed-password');
      UserModel.createUser.mockResolvedValue({ id: '1', username: 'stanley' });

      const result = await AuthService.registerUser('stanley', '123', 'Stan');

      expect(hashHelper.hashString).toHaveBeenCalledWith('123', 10);
      expect(UserModel.createUser).toHaveBeenCalledWith({
        username: 'stanley',
        password: 'hashed-password',
        name: 'Stan',
        roleId: 99,
      });
      expect(result.id).toBe('1');
    });
  });

  describe('logoutUser', () => {
    it('登出時應該去 Redis 刪除 Refresh Token', async () => {
      await AuthService.logoutUser('5');
      const expectedKey = getRefreshTokenKey('5');
      expect(redisClient.del).toHaveBeenCalledWith(expectedKey);
    });
  });

  describe('verify2FALogin', () => {
    it('如果是偽造的 token purpose，應該阻擋', async () => {
      jwtHelper.verifyTempToken.mockReturnValue({
        id: 1,
        purpose: 'fake-purpose',
      });
      await expect(
        AuthService.verify2FALogin('token', '123456'),
      ).rejects.toThrow('無效的憑證類型');
    });

    it('驗證成功，應回傳 user', async () => {
      jwtHelper.verifyTempToken.mockReturnValue({ id: 1, purpose: '2fa' });
      UserModel.findById.mockResolvedValue({
        id: 1,
        twoFactorAuth: {
          isEnabled: true,
          secret: 'secret-key',
        },
      });
      twoFAHelper.otpVerify.mockResolvedValue(true);

      const user = await AuthService.verify2FALogin('token', '123456');

      expect(twoFAHelper.otpVerify).toHaveBeenCalledWith({
        token: '123456',
        secret: 'secret-key',
      });
      expect(user.id).toBe(1);
    });
  });

  describe('verifyAndEnable2FA', () => {
    it('如果還沒 setup 產生 secret，應該阻擋', async () => {
      UserModel.findById.mockResolvedValue({
        id: '1',
        twoFactorAuth: null,
      });
      await expect(
        AuthService.verifyAndEnable2FA('1', '123456'),
      ).rejects.toThrow('尚未產生 2FA 金鑰');
    });
  });

  describe('refreshAccessToken', () => {
    it('Redis 裡找不到 token 或不吻合，應該強制登出 (丟 403)', async () => {
      jwtHelper.verifyRefreshToken.mockReturnValue({ id: 1 });
      redisClient.get.mockResolvedValue('old-token-in-redis'); // 拿到的跟傳入的不同

      await expect(
        AuthService.refreshAccessToken('new-hacked-token'),
      ).rejects.toThrow('Refresh Token 無效或已被撤銷');
    });
  });

  describe('processForgotPassword', () => {
    it('【資安關鍵】找不到帳號時，應該默默 Return 不拋錯誤 (防帳號枚舉)', async () => {
      UserModel.findByUsername.mockResolvedValue(null);

      await AuthService.processForgotPassword('not-exist-user');

      // 確保沒有去產生 Token 或寫入 DB
      expect(cryptoHelper.generateRandomToken).not.toHaveBeenCalled();
      expect(UserModel.updateUser).not.toHaveBeenCalled();
    });

    it('找到帳號時，應該產生 Token 並寫入 DB 與發送信件通知', async () => {
      UserModel.findByUsername.mockResolvedValue({
        id: '5',
        username: 'stanley',
      });
      cryptoHelper.generateRandomToken.mockReturnValue('random-abc');

      await AuthService.processForgotPassword('stanley');

      expect(PasswordResetTokenModel.createResetToken).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: '5',
          token: 'random-abc',
          expiresAt: expect.any(Date),
        }),
      );
    });
  });

  describe('processResetPassword', () => {
    it('密碼重設成功後，應該刪除登入失敗的 Rate Limit 快取', async () => {
      UserModel.findByValidResetToken.mockResolvedValue({
        id: '5',
        username: 'stanley',
      });
      hashHelper.hashString.mockResolvedValue('new-hash');

      await AuthService.processResetPassword('valid-token', 'newPassword');

      expect(UserModel.resetPassword).toHaveBeenCalledWith('5', 'new-hash');
      expect(redisClient.del).toHaveBeenCalledWith(
        getAccountRateLimitKey('stanley'),
      );
    });
  });
});
