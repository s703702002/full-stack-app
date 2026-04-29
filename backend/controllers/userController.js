import UserModel from '../models/userModel.js';
import { sanitizeUser } from '../utils/formatters.js';
import { sendSuccess } from '../utils/response.js';
import AppError from '../utils/AppError.js';
import * as UserService from '../services/userService.js';

export const getMe = async (req, res) => {
  const userId = req.user.id;
  const user = await UserModel.findById(userId, true);

  if (!user) {
    throw new AppError('找不到使用者帳號', 404);
  }

  sendSuccess(res, 200, { user: sanitizeUser(user) });
};

export const getAllUsers = async (req, res) => {
  const users = await UserModel.findAllWithRole();
  const sanitizeUsers = users.map(sanitizeUser);

  sendSuccess(res, 200, { users: sanitizeUsers });
};

export const updateUserRole = async (req, res) => {
  const operatorId = req.user.id;
  const targetUserId = req.params.id;
  const { newRoleName } = req.body;

  await UserService.changeUserRole(operatorId, targetUserId, newRoleName);

  sendSuccess(res, 200, {}, `成功將使用者更改為 ${newRoleName} 角色`);
};

export const updateProfile = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;
  const updateData = { name: name };
  const newAvatarKey = req.file ? req.file.key : null;

  const updatedUser = await UserService.updateProfile(
    userId,
    updateData,
    newAvatarKey,
  );

  sendSuccess(res, 200, sanitizeUser(updatedUser), '個人資料更新成功');
};
