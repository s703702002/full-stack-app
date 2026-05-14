import UserModel from '../models/userModel.js';
import { sanitizeUser } from '../utils/formatters.js';
import { sendSuccess } from '../utils/response.js';
import AppError from '../utils/AppError.js';
import * as UserService from '../services/userService.js';
import PostModel from '../models/postModel.js';

export const getMe = async (req, res) => {
  const userId = req.user.id;
  const user = await UserModel.findById(userId, { role: true });

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
  const { name, bio } = req.body;
  const userId = req.user.id;
  const updateData = { name: name, bio };
  const newAvatarKey = req.file ? req.file.key : null;

  const updatedUser = await UserService.updateProfile(
    userId,
    updateData,
    newAvatarKey,
  );

  sendSuccess(res, 200, sanitizeUser(updatedUser), '個人資料更新成功');
};

export const getUserProfile = async (req, res) => {
  const operatorId = req.user.id;
  const id = req.params.id;
  const user = await UserModel.findById(id);

  if (!user) throw new AppError('找不到該使用者', 404);
  const isOwnProfile = operatorId === user.id;

  sendSuccess(res, 200, { user: { ...sanitizeUser(user), isOwnProfile } });
};

export const getUserTimeline = async (req, res) => {
  const id = req.params.id;
  const targetUser = await UserModel.findById(id);
  if (!targetUser) throw new AppError('找不到該使用者', 404);

  const posts = await PostModel.findAllByUserId(targetUser.id);

  sendSuccess(res, 200, { posts });
};
