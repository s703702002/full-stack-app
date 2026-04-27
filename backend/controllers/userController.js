import UserModel from '../models/userModel.js';
import { sanitizeUser } from '../utils/formatters.js';
import { sendSuccess } from '../utils/response.js';
import AppError from '../utils/AppError.js';
import { deleteFile } from '../utils/fsHelper.js';
import { join } from '../utils/pathHelper.js';

export const getMe = async (req, res) => {
  const userId = req.user.id;
  const user = await UserModel.findByIdWithRole(userId);

  if (!user) {
    throw new AppError('找不到使用者帳號', 404);
  }

  sendSuccess(res, 200, { user: sanitizeUser(user) });
};

export const getAllUsers = async (req, res) => {
  const users = await UserModel.findAllWithRole();
  const sanitizeUsers = users.map((u) => sanitizeUser(u));
  sendSuccess(res, 200, { users: sanitizeUsers });
};

export const updateUserRole = async (req, res) => {
  const targetUserId = req.params.id;
  const { newRoleName } = req.body;

  if (newRoleName === 'superadmin') {
    throw new AppError('權限不足：無法將使用者指派為系統最高管理員！', 403);
  }

  const targetUser = await UserModel.findById(targetUserId);
  if (!targetUser) throw new AppError('找不到該使用者', 404);

  if (targetUser.username === 'root') {
    throw new AppError('權限不足：無法變更系統創世神的角色！', 403);
  }

  const newRole = await UserModel.findRoleByName(newRoleName);
  if (!newRole) throw new AppError('找不到該角色', 400);

  if (Number.parseInt(targetUserId) === req.user.id) {
    throw new AppError('你不能更改自己的角色！', 400);
  }

  await UserModel.updateRoleId(targetUserId, newRole.id);

  sendSuccess(res, 200, {}, `成功將使用者更改為 ${newRoleName} 角色`);
};

export const updateProfile = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  const updateData = { name: name };

  const currentUser = await UserModel.findById(userId);

  if (req.file) {
    updateData.avatarUrl = `/uploads/avatars/${req.file.filename}`;

    if (currentUser.avatarUrl) {
      const oldFilePath = join(process.cwd(), 'public', currentUser.avatarUrl);
      deleteFile(oldFilePath);
    }
  }

  const updatedUser = await UserModel.updateProfile(userId, updateData);

  sendSuccess(res, 200, sanitizeUser(updatedUser), '個人資料更新成功');
};
