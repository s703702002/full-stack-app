import type { Request, Response } from 'express';
import PostModel from '../models/postModel.js';
import * as PostService from '../services/postService.js';
import { formatLikers } from '../utils/formatters.js';
import { sendSuccess } from '../utils/response.js';
import { getAuthUser } from '../utils/requestHelper.js';

export const getAllPosts = async (_req: Request, res: Response) => {
  sendSuccess(res, 200, { posts: [] });
};

export const getPostLikers = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const likes = await PostModel.getPostLikers(req.params.id);
  const likers = likes.map(formatLikers);
  sendSuccess(res, 200, { count: likers.length, likers }, '取得按讚名單成功');
};

export const createPost = async (req: Request, res: Response) => {
  const { content, targetUserId } = req.body as {
    content: string;
    targetUserId: string;
  };
  const user = getAuthUser(req);
  const newPost = await PostService.createPost(user.id, content, targetUserId);
  sendSuccess(res, 201, { post: newPost }, '留言發布成功');
};

export const updatePost = async (
  req: Request<{ id: string }, unknown, { content: string }>,
  res: Response,
) => {
  const user = getAuthUser(req);
  await PostService.updatePost(user, req.params.id, req.body.content);
  sendSuccess(res, 200, {}, '留言更新成功');
};

export const deletePost = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const user = getAuthUser(req);
  await PostService.deletePost(user, req.params.id);
  sendSuccess(res, 200, {}, '留言已成功刪除');
};

export const toggleLikePost = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const user = getAuthUser(req);
  const isLiked = await PostService.toggleLike(user.id, req.params.id);
  sendSuccess(res, 200, { isLiked }, isLiked ? '已點讚' : '已取消點讚');
};
