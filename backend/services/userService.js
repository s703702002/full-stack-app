import UserModel from '../models/userModel.js';
import AppError from '../utils/AppError.js';
import { deleteFromS3 } from '../utils/s3Utils.js';

export const changeUserRole = async (operatorId, targetUserId, newRoleName) => {
  if (newRoleName === 'superadmin') {
    throw new AppError('權限不足：無法將使用者指派為系統最高管理員！', 403);
  }

  if (Number.parseInt(targetUserId) === operatorId) {
    throw new AppError('你不能更改自己的角色！', 400);
  }

  const targetUser = await UserModel.findById(targetUserId);
  if (!targetUser) throw new AppError('找不到該使用者', 404);

  if (targetUser.username === 'root') {
    throw new AppError('權限不足：無法變更系統創世神的角色！', 403);
  }

  const newRole = await UserModel.findRoleByName(newRoleName);
  if (!newRole) throw new AppError('找不到該角色', 400);

  return await UserModel.updateUser(targetUserId, { roleId: newRole.id });
};

export const updateProfile = async (userId, newProfile, newAvatarKey) => {
  const updateData = { ...newProfile };

  if (newAvatarKey) {
    updateData.avatarUrl = newAvatarKey;

    const currentUser = await UserModel.findById(userId);

    if (currentUser?.avatarUrl) {
      await deleteFromS3(currentUser.avatarUrl);
    }
  }

  return await UserModel.updateUser(userId, updateData);
};
