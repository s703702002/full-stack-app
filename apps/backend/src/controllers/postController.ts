import type { Request, Response } from 'express';
import PostModel from '../models/postModel.js';
import * as PostService from '../services/postService.js';
import { formatPost, withBaseUrl } from '../utils/formatters.js';
import { sendSuccess } from '../utils/response.js';
import { getAuthUser } from '../utils/requestHelper.js';
import type { PostDTO } from '@full-stack-app/shared';
import { CreatePostBody, UpdatePostBody } from '../validators/postValidator.js';

export const getPostLikers = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const likers = await PostModel.getPostLikers(req.params.id);
  sendSuccess(
    res,
    200,
    {
      count: likers.length,
      likers: likers.map((liker) => ({
        ...liker.user,
        avatarUrl: withBaseUrl(liker.user.avatarUrl),
      })),
    },
    '取得按讚名單成功',
  );
};

export const createPost = async (req: Request, res: Response) => {
  const { content, targetUserId } = req.body as CreatePostBody;
  const user = getAuthUser(req);
  const newPost = await PostService.createPost(user.id, content, targetUserId);
  sendSuccess<{ post: PostDTO }>(
    res,
    201,
    { post: formatPost(newPost) },
    '留言發布成功',
  );
};

export const updatePost = async (
  req: Request<{ id: string }, unknown, UpdatePostBody>,
  res: Response,
) => {
  const user = getAuthUser(req);
  const updatedPost = await PostService.updatePost(
    user,
    req.params.id,
    req.body.content,
  );
  sendSuccess<{ post: PostDTO }>(
    res,
    200,
    { post: formatPost(updatedPost) },
    '留言更新成功',
  );
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
