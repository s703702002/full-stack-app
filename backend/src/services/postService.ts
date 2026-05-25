import PostLikeModel from '../models/postLikeModel.js';
import PostModel from '../models/postModel.js';
import UserModel from '../models/userModel.js';
import FriendshipModel from '../models/friendshipModel.js';
import { PostPolicy } from '../policies/PostPolicy.js';
import AppError from '../utils/AppError.js';
import { sendNotification } from '../utils/sseManager.js';
import type { AuthUser } from '../types/auth.js';

export const createPost = async (
  userId: string,
  content: string,
  targetUserId: string,
): Promise<void> => {
  if (userId !== targetUserId) {
    const friendship = await FriendshipModel.findAcceptedByPair(
      userId,
      targetUserId,
    );
    if (!friendship) {
      throw new AppError('你只能貼文到自己的塗鴉牆或朋友的塗鴉牆', 403);
    }
  }

  await PostModel.createPost(userId, content, targetUserId);
};

export const updatePost = async (
  user: AuthUser,
  postId: string,
  content: string,
) => {
  const post = await PostModel.findById(postId);
  if (!post) throw new AppError('留言不存在', 404);

  if (!PostPolicy.canEdit(user, post)) {
    throw new AppError('你沒有權限編輯這篇留言', 403);
  }

  return await PostModel.updatePost(postId, { content });
};

export const deletePost = async (user: AuthUser, postId: string) => {
  const post = await PostModel.findById(postId);
  if (!post) throw new AppError('留言不存在', 404);

  if (!PostPolicy.canDelete(user, post)) {
    throw new AppError('你沒有權限刪除這篇留言', 403);
  }

  return await PostModel.deleteById(postId);
};

export const toggleLike = async (
  operatorId: string,
  postId: string,
): Promise<boolean> => {
  const post = await PostModel.findById(postId);
  if (!post) throw new AppError('留言不存在', 404);

  const existingLike = await PostLikeModel.findUserLike(operatorId, postId);

  if (existingLike) {
    await PostLikeModel.deleteLike(operatorId, postId);
  } else {
    await PostLikeModel.createLike(operatorId, postId);

    if (post.userId !== operatorId) {
      const operator = await UserModel.findById(operatorId);
      const displayName = operator?.name ?? operator?.username ?? '有人';

      sendNotification(post.userId, {
        type: 'NEW_LIKE',
        message: `${displayName} 剛剛對你的留言按了讚！`,
        postId,
        timestamp: new Date(),
      });
    }
  }

  return !existingLike;
};
