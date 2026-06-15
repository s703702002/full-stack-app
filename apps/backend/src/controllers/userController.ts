import type { Request, Response } from 'express';
import UserModel from '../models/userModel.js';
import {
  sanitizeUser,
  formatPost,
  formatBanInfo,
  withBaseUrl,
} from '../utils/formatters.js';
import { sendSuccess } from '../utils/response.js';
import AppError from '../utils/AppError.js';
import * as UserService from '../services/userService.js';
import PostModel from '../models/postModel.js';
import { getAuthUser } from '../utils/requestHelper.js';
import type {
  UserDTO,
  PostDTO,
  PaginatedResponse,
} from '@full-stack-app/shared';

export const getMe = async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const userWithRole = await UserModel.findById(user.id, { role: true });
  if (!userWithRole) throw new AppError('找不到使用者帳號', 404);
  sendSuccess<{ user: UserDTO | null }>(res, 200, {
    user: sanitizeUser(userWithRole),
  });
};

export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await UserModel.findAllWithRole();
  sendSuccess<{ users: UserDTO[] }>(res, 200, {
    users: users.map((user) => {
      const sanitized = sanitizeUser(user);
      return {
        ...sanitized!,
        activeBan: user.bans[0] ? formatBanInfo(user.bans[0]) : null,
      };
    }),
  });
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

  sendSuccess<UserDTO>(res, 200, sanitized, '個人資料更新成功');
};

export const getUserProfile = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const user = getAuthUser(req);
  const targetUser = await UserModel.findById(req.params.id);
  if (!targetUser) throw new AppError('找不到該使用者', 404);

  const sanitized = sanitizeUser(targetUser);
  sendSuccess<{ user: UserDTO }>(res, 200, {
    user: {
      ...sanitized!,
      isOwnProfile: user.id === targetUser.id,
    },
  });
};

export const getUserTimeline = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const user = getAuthUser(req);
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const targetUser = await UserModel.findById(req.params.id);
  if (!targetUser) throw new AppError('找不到該使用者', 404);

  const { posts, total } = await PostModel.findAllByUserId(
    targetUser.id,
    page,
    limit,
  );

  sendSuccess<PaginatedResponse<PostDTO>>(res, 200, {
    items: posts.map((post) => ({
      ...formatPost(post),
      authorName: post.author?.name,
      authorAvatarUrl: withBaseUrl(post.author?.avatarUrl),
      likeCount: post.likes.length ?? 0,
      isLikedByMe: post.likes.some((like) => like.userId === user.id),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
    },
  });
};

export const banUser = async (req: Request<{ id: string }>, res: Response) => {
  const user = getAuthUser(req);
  const { reason, durationMinutes } = req.body;
  await UserService.banUser(user.id, req.params.id, reason, durationMinutes);
  sendSuccess(res, 200, {}, '已停用該使用者');
};

export const liftBanUser = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  await UserService.liftBan(req.params.id);
  sendSuccess(res, 200, {}, '已解除停用');
};
