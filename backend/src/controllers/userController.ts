import type { Request, Response } from 'express';
import UserModel from '../models/userModel.js';
import { sanitizeUser, formatPost } from '../utils/formatters.js';
import { sendSuccess } from '../utils/response.js';
import AppError from '../utils/AppError.js';
import * as UserService from '../services/userService.js';
import PostModel from '../models/postModel.js';
import { getAuthUser } from '../utils/requestHelper.js';

export const getMe = async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const userWithRole = await UserModel.findById(user.id, { role: true });
  if (!userWithRole) throw new AppError('找不到使用者帳號', 404);
  sendSuccess(res, 200, { user: sanitizeUser(userWithRole) });
};

export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await UserModel.findAllWithRole();
  sendSuccess(res, 200, { users: users.map(sanitizeUser) });
};

export const updateUserRole = async (
  req: Request<{ id: string }, unknown, { newRoleName: string }>,
  res: Response,
) => {
  const user = getAuthUser(req);
  const { newRoleName } = req.body;
  await UserService.changeUserRole(user.id, req.params.id, newRoleName);
  sendSuccess(res, 200, {}, `成功將使用者更改為 ${newRoleName} 角色`);
};

export const updateProfile = async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { name, bio } = req.body as { name: string; bio?: string };
  const newAvatarKey = req.file?.key ?? undefined;

  const updatedUser = await UserService.updateProfile(
    user.id,
    { name, bio },
    newAvatarKey,
  );
  const sanitized = sanitizeUser(updatedUser);
  if (!sanitized) throw new AppError('更新失敗', 500);

  sendSuccess(res, 200, sanitized, '個人資料更新成功');
};

export const getUserProfile = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const user = getAuthUser(req);
  const targetUser = await UserModel.findById(req.params.id);
  if (!targetUser) throw new AppError('找不到該使用者', 404);

  sendSuccess(res, 200, {
    user: {
      ...sanitizeUser(targetUser),
      isOwnProfile: user.id === targetUser.id,
    },
  });
};

export const getUserTimeline = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const user = getAuthUser(req);
  const targetUser = await UserModel.findById(req.params.id);
  if (!targetUser) throw new AppError('找不到該使用者', 404);

  const posts = await PostModel.findAllByUserId(targetUser.id);

  sendSuccess(res, 200, {
    posts: posts.map((post) => formatPost(post, user.id)),
  });
};
