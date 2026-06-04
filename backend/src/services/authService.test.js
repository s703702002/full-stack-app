import { vi, test, describe, expect } from 'vitest';

// ── mock 所有外部依賴 ──────────────────────────────────────────
vi.mock('../models/userModel.js');
vi.mock('../models/roleModel.js');
vi.mock('../models/TwoFactorAuthMode.js');
vi.mock('../config/redis.js');
vi.mock('../utils/hashHelper.js');
vi.mock('../utils/cryptoHelper.js');
vi.mock('../utils/twoFAHelper.js');
vi.mock('../utils/logger.js', () => ({ default: { info: vi.fn() } }));

import UserModel from '../models/userModel.js';
import RoleModel from '../models/roleModel.js';
import TwoFactorAuthModel from '../models/TwoFactorAuthMode.js';
import redisClient from '../config/redis.js';
import { hashString } from '../utils/hashHelper.js';
import { generateRandomToken } from '../utils/cryptoHelper.js';
import { generate2FA, otpVerify } from '../utils/twoFAHelper.js';

import {
  registerUser,
  verify2FALogin,
  logoutUser,
  processForgotPassword,
  processResetPassword,
  setupUser2FA,
  verifyAndEnable2FA,
} from '../services/authService.js';
import { getResetPasswordKey } from '../constants/redisKeys.js';

// ── 共用 fixtures ──────────────────────────────────────────────
const mockUser = {
  id: 'user-123',
  username: 'testuser',
  password: 'hashed-password',
  name: 'Test User',
  role: { id: 1, name: 'viewer' },
  twoFactorAuth: { id: 'tfa-1', secret: 'TOTP_SECRET' },
};

const mockRole = { id: 1, name: 'viewer' };

// ── 每個 test 前重置所有 mock ──────────────────────────────────
test.beforeEach(() => {
  vi.clearAllMocks();
});

// ══════════════════════════════════════════════════════════════
// registerUser
// ══════════════════════════════════════════════════════════════
describe('registerUser', () => {
  test('成功建立新使用者', async () => {
    UserModel.findByUsername.mockResolvedValue(null);
    RoleModel.findByName.mockResolvedValue(mockRole);
    hashString.mockResolvedValue('hashed-password');
    UserModel.createUser.mockResolvedValue(mockUser);

    const result = await registerUser('testuser', 'password123', 'Test User');

    expect(UserModel.findByUsername).toHaveBeenCalledWith('testuser');
    expect(hashString).toHaveBeenCalledWith('password123', 10);
    expect(UserModel.createUser).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'hashed-password',
      name: 'Test User',
      roleId: mockRole.id,
    });
    expect(result).toEqual(mockUser);
  });

  test('帳號已存在時拋出 409', async () => {
    UserModel.findByUsername.mockResolvedValue(mockUser);

    await expect(
      registerUser('testuser', 'password123', 'Test User'),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: '這個帳號已經被註冊過了',
    });

    expect(UserModel.createUser).not.toHaveBeenCalled();
  });

  test('找不到預設角色時拋出 500', async () => {
    UserModel.findByUsername.mockResolvedValue(null);
    RoleModel.findByName.mockResolvedValue(null);

    await expect(
      registerUser('testuser', 'password123', 'Test User'),
    ).rejects.toMatchObject({ statusCode: 500 });
  });
});

// ══════════════════════════════════════════════════════════════
// verify2FALogin
// ══════════════════════════════════════════════════════════════
describe('verify2FALogin', () => {
  test('TOTP 正確時回傳 user', async () => {
    UserModel.findById.mockResolvedValue(mockUser);
    otpVerify.mockResolvedValue(true);

    const result = await verify2FALogin('user-123', '123456');

    expect(UserModel.findById).toHaveBeenCalledWith('user-123', {
      role: true,
      twoFactorAuth: true,
    });
    expect(otpVerify).toHaveBeenCalledWith({
      token: '123456',
      secret: mockUser.twoFactorAuth.secret,
    });
    expect(result).toEqual(mockUser);
  });

  test('找不到 user 時拋出 401', async () => {
    UserModel.findById.mockResolvedValue(null);

    await expect(verify2FALogin('invalid-id', '123456')).rejects.toMatchObject({
      statusCode: 401,
    });

    expect(otpVerify).not.toHaveBeenCalled();
  });

  test('TOTP 錯誤時拋出錯誤（otpVerify 本身 throw）', async () => {
    UserModel.findById.mockResolvedValue(mockUser);
    otpVerify.mockRejectedValue(new Error('Invalid TOTP'));

    await expect(verify2FALogin('user-123', 'wrong-code')).rejects.toThrow(
      'Invalid TOTP',
    );
  });
});

// ══════════════════════════════════════════════════════════════
// logoutUser
// ══════════════════════════════════════════════════════════════
describe('logoutUser', () => {
  test('刪除 Redis 中的 refresh token', async () => {
    redisClient.del.mockResolvedValue(1);

    await logoutUser('user-123');

    // key 格式包含 userId
    expect(redisClient.del).toHaveBeenCalledWith(
      expect.stringContaining('user-123'),
    );
  });
});

// ══════════════════════════════════════════════════════════════
// processForgotPassword
// ══════════════════════════════════════════════════════════════
describe('processForgotPassword', () => {
  test('帳號存在時產生 reset token 並存入 redis，有效期 30 分鐘', async () => {
    UserModel.findByUsername.mockResolvedValue(mockUser);
    generateRandomToken.mockReturnValue('random-token-abc');

    await processForgotPassword('testuser');

    expect(redisClient.set).toHaveBeenCalledWith(
      getResetPasswordKey('random-token-abc'),
      mockUser.id,
      {
        expiration: {
          type: 'EX',
          value: 60 * 30,
        },
      }
    );
  });

  test('帳號不存在時靜默 return，不拋錯（防帳號枚舉）', async () => {
    UserModel.findByUsername.mockResolvedValue(null);

    await expect(processForgotPassword('nonexistent')).resolves.toBeUndefined();

    expect(redisClient.set).not.toHaveBeenCalled();
  });
});

// ══════════════════════════════════════════════════════════════
// processResetPassword
// ══════════════════════════════════════════════════════════════
describe('processResetPassword', () => {
  test('合法 token 時成功重設密碼', async () => {
    redisClient.get.mockResolvedValue('test-user-id')
    hashString.mockResolvedValue('new-hashed-password');

    await processResetPassword('valid-token', 'newPassword123');

    expect(hashString).toHaveBeenCalledWith('newPassword123', 10);
    expect(redisClient.del).toHaveBeenCalled();
  });

  test('token 無效或過期時拋出 400', async () => {
    redisClient.get.mockResolvedValue(null);

    await expect(
      processResetPassword('invalid-token', 'newPassword123'),
    ).rejects.toMatchObject({ statusCode: 400, message: '連結無效或已過期' });
  });

  test('重設成功後清除 redis key', async () => {
    redisClient.get.mockResolvedValue('test-user-id');
    hashString.mockResolvedValue('hashed');
    UserModel.resetPassword.mockResolvedValue();

    await processResetPassword('valid-token', 'newPassword123');

    expect(redisClient.del).toHaveBeenCalledWith(
      expect.stringContaining(mockUser.username),
    );
  });
});

// ══════════════════════════════════════════════════════════════
// setupUser2FA
// ══════════════════════════════════════════════════════════════
describe('setupUser2FA', () => {
  test('產生 2FA secret 並儲存，回傳 secret 和 qrCode', async () => {
    generate2FA.mockResolvedValue({
      secret: 'NEW_SECRET',
      qrCodeImage: 'data:image/png;base64,...',
    });
    TwoFactorAuthModel.upsertTwoFactorAuth.mockResolvedValue();

    const result = await setupUser2FA('user-123', 'testuser');

    expect(generate2FA).toHaveBeenCalledWith('testuser');
    expect(TwoFactorAuthModel.upsertTwoFactorAuth).toHaveBeenCalledWith(
      'user-123',
      'NEW_SECRET',
    );
    expect(result).toEqual({
      secret: 'NEW_SECRET',
      qrCodeImage: 'data:image/png;base64,...',
    });
  });
});

// ══════════════════════════════════════════════════════════════
// verifyAndEnable2FA
// ══════════════════════════════════════════════════════════════
describe('verifyAndEnable2FA', () => {
  test('TOTP 正確時啟用 2FA', async () => {
    TwoFactorAuthModel.findByUserId.mockResolvedValue({
      id: 'tfa-1',
      secret: 'SECRET',
    });
    otpVerify.mockResolvedValue(true);
    TwoFactorAuthModel.enableById.mockResolvedValue();

    await verifyAndEnable2FA('user-123', '123456');

    expect(otpVerify).toHaveBeenCalledWith({
      token: '123456',
      secret: 'SECRET',
    });
    expect(TwoFactorAuthModel.enableById).toHaveBeenCalledWith('tfa-1');
  });

  test('尚未 setup 時拋出 400', async () => {
    TwoFactorAuthModel.findByUserId.mockResolvedValue(null);

    await expect(
      verifyAndEnable2FA('user-123', '123456'),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: '尚未產生 2FA 金鑰，請先執行 setup',
    });

    expect(otpVerify).not.toHaveBeenCalled();
    expect(TwoFactorAuthModel.enableById).not.toHaveBeenCalled();
  });

  test('TOTP 錯誤時不啟用（otpVerify throw）', async () => {
    TwoFactorAuthModel.findByUserId.mockResolvedValue({
      id: 'tfa-1',
      secret: 'SECRET',
    });
    otpVerify.mockRejectedValue(new Error('Invalid TOTP'));

    await expect(verifyAndEnable2FA('user-123', 'wrong')).rejects.toThrow(
      'Invalid TOTP',
    );

    expect(TwoFactorAuthModel.enableById).not.toHaveBeenCalled();
  });
});
