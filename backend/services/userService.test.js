import { describe, it, expect, vi, beforeEach } from 'vitest';
import { changeUserRole, updateProfile } from '../services/userService.js';
import UserModel from '../models/userModel.js';
import RoleModel from '../models/roleModel.js';
import * as s3Utils from '../utils/s3Utils.js';
import * as PermissionService from './permissionService.js';

vi.mock('../models/userModel.js');
vi.mock('../models/roleModel.js');
vi.mock('../utils/s3Utils.js');
vi.mock('./permissionService.js');

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('changeUserRole', () => {
    it('如果嘗試指派為 superadmin，應該拋出 403 錯誤', async () => {
      // 驗證是否攔截了特權角色
      await expect(changeUserRole(1, 2, 'superadmin')).rejects.toThrow(
        '無法將使用者指派為系統最高管理員',
      );
    });

    it('如果嘗試更改自己的角色，應該拋出 400 錯誤', async () => {
      // 驗證操作者 ID 和 目標 ID 相同時的防呆
      await expect(changeUserRole(1, 1, 'admin')).rejects.toThrow(
        '你不能更改自己的角色',
      );
    });

    it('如果找不到目標使用者，應該拋出 404 錯誤', async () => {
      // 安排：資料庫回傳 null
      UserModel.findById.mockResolvedValue(null);
      await expect(changeUserRole(1, 2, 'admin')).rejects.toThrow(
        '找不到該使用者',
      );
    });

    it('如果嘗試更改 root 的角色，應該拋出 403 錯誤', async () => {
      // 安排：資料庫回傳的目標使用者是 root
      UserModel.findById.mockResolvedValue({ id: 2, username: 'root' });
      await expect(changeUserRole(1, 2, 'admin')).rejects.toThrow(
        '無法變更系統創世神的角色',
      );
    });

    it('如果找不到要變更的新角色，應該拋出 400 錯誤', async () => {
      // 安排：使用者存在，但角色不存在
      UserModel.findById.mockResolvedValue({ id: 2, username: 'normal_user' });
      RoleModel.findByName.mockResolvedValue(null);

      await expect(changeUserRole(1, 2, 'ghost_role')).rejects.toThrow(
        '找不到該角色',
      );
    });

    it('成功變更角色，應該呼叫 updateUser', async () => {
      // 安排：一路順暢通過所有 if 條件
      UserModel.findById.mockResolvedValue({ id: 2, username: 'normal_user' });
      RoleModel.findByName.mockResolvedValue({ id: 99, name: 'admin' });

      // 執行
      await changeUserRole(1, 2, 'admin');

      // 驗證：是否拿著正確的 targetUserId 和 role.id 去更新資料庫
      expect(UserModel.updateUser).toHaveBeenCalledWith(2, { roleId: 99 });
    });

    it('成功變更角色時，應該更新資料庫並「主動清空」該使用者的權限快取', async () => {
      // 安排 (Arrange)
      const targetUserId = 2;
      const newRoleName = 'admin';
      const mockRoleId = 99;

      UserModel.findById.mockResolvedValue({
        id: targetUserId,
        username: 'normal_user',
      });
      RoleModel.findByName.mockResolvedValue({
        id: mockRoleId,
        name: newRoleName,
      });

      // 執行 (Act)
      await changeUserRole(1, targetUserId, newRoleName);

      // 驗證 (Assert)
      // 驗證資料庫有更新
      expect(UserModel.updateUser).toHaveBeenCalledWith(targetUserId, {
        roleId: mockRoleId,
      });

      // 驗證是否有呼叫「清空快取」的函式，且參數是正確的 targetUserId
      expect(PermissionService.clearUserPermissionCache).toHaveBeenCalledWith(
        targetUserId,
      );

      // 確保它是「在資料庫更新後」才呼叫 (選用，增加信心)
      const updateUserOrder = vi.mocked(UserModel.updateUser).mock
        .invocationCallOrder[0];
      const clearCacheOrder = vi.mocked(
        PermissionService.clearUserPermissionCache,
      ).mock.invocationCallOrder[0];
      expect(clearCacheOrder).toBeGreaterThan(updateUserOrder);
    });
  });

  describe('updateProfile', () => {
    it('只更新一般資料（無大頭貼），不應觸發 S3 刪除邏輯', async () => {
      const newProfile = { name: 'Stanley Huang' };

      // 執行
      await updateProfile(1, newProfile, undefined);

      // 驗證
      expect(UserModel.findById).not.toHaveBeenCalled(); // 沒換大頭貼就不該去查舊資料
      expect(s3Utils.deleteFromS3).not.toHaveBeenCalled(); // 不該觸發刪除
      expect(UserModel.updateUser).toHaveBeenCalledWith(1, {
        name: 'Stanley Huang',
      });
    });

    it('有換新大頭貼，且原本【沒有】舊大頭貼，不應觸發 S3 刪除', async () => {
      const newProfile = { name: 'Stanley' };
      const newAvatarKey = 'new-avatar-123.jpg';

      // 安排：原本的使用者 avatarUrl 是 null
      UserModel.findById.mockResolvedValue({ id: 1, avatarUrl: null });

      // 執行
      await updateProfile(1, newProfile, newAvatarKey);

      // 驗證
      expect(s3Utils.deleteFromS3).not.toHaveBeenCalled(); // 沒有舊圖，不用刪除
      expect(UserModel.updateUser).toHaveBeenCalledWith(1, {
        name: 'Stanley',
        avatarUrl: 'new-avatar-123.jpg',
      });
    });

    it('有換新大頭貼，且原本【有】舊大頭貼，應該觸發 S3 刪除舊圖', async () => {
      const newProfile = { name: 'Stanley' };
      const newAvatarKey = 'new-avatar-456.jpg';

      // 安排：原本的使用者有舊大頭貼
      UserModel.findById.mockResolvedValue({
        id: 1,
        avatarUrl: 'old-avatar-999.jpg',
      });

      // 執行
      await updateProfile(1, newProfile, newAvatarKey);

      // 驗證
      expect(s3Utils.deleteFromS3).toHaveBeenCalledWith('old-avatar-999.jpg');
      expect(UserModel.updateUser).toHaveBeenCalledWith(1, {
        name: 'Stanley',
        avatarUrl: 'new-avatar-456.jpg',
      });
    });
  });
});
