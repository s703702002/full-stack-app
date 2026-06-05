import RoleModel from '../models/roleModel.js';
import UserModel from '../models/userModel.js';
import AppError from '../utils/AppError.js';
import { deleteFromS3 } from '../utils/s3Utils.js';
import type { Prisma } from '../generated/client.js';
import * as UserBanModel from '../models/userBanModel.js';

export const changeUserRole = async (
  operatorId: string,
  targetUserId: string,
  newRoleName: string,
): Promise<void> => {
  if (newRoleName === 'superadmin') {
    throw new AppError('權限不足：無法將使用者指派為系統最高管理員！', 403);
  }

  if (targetUserId === operatorId) {
    throw new AppError('你不能更改自己的角色！', 400);
  }

  const targetUser = await UserModel.findById(targetUserId);
  if (!targetUser) throw new AppError('找不到該使用者', 404);

  if (targetUser.username === 'root') {
    throw new AppError('權限不足：無法變更系統創世神的角色！', 403);
  }

  const newRole = await RoleModel.findByName(newRoleName);
  if (!newRole) throw new AppError('找不到該角色', 400);

  await UserModel.updateUser(targetUserId, { roleId: newRole.id });
};

export const updateProfile = async (
  userId: string,
  newProfile: Prisma.UserUpdateInput,
  newAvatarKey?: string,
) => {
  const updateData: Prisma.UserUpdateInput = { ...newProfile };

  if (newAvatarKey) {
    updateData.avatarUrl = newAvatarKey;

    const currentUser = await UserModel.findById(userId);
    if (currentUser?.avatarUrl) {
      await deleteFromS3(currentUser.avatarUrl);
    }
  }

  return await UserModel.updateUser(userId, updateData);
};

export const banUser = async (
  adminId: string,
  targetUserId: string,
  reason: string,
  durationMinutes: number,
) => {
  const activeBan = await UserBanModel.findActiveBan(targetUserId);
  if (activeBan) throw new AppError('該使用者已在停用狀態', 400);

  const expiresAt =
    durationMinutes === 0
      ? null
      : new Date(Date.now() + durationMinutes * 60 * 1000);

  return await UserBanModel.createBan(adminId, targetUserId, reason, expiresAt);
};

export const liftBan = async (targetUserId: string) => {
  const activeBan = await UserBanModel.findActiveBan(targetUserId);
  if (!activeBan) throw new AppError('該使用者沒有有效的停用紀錄', 400);

  return await UserBanModel.deleteById(activeBan.id);
};
