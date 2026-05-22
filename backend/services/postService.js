import PostLikeModel from '../models/postLikeModel.js';
import PostModel from '../models/postModel.js';
import UserModel from '../models/userModel.js';
import FriendshipModel from '../models/friendshipModel.js';
import { PostPolicy } from '../policies/PostPolicy.js';
import AppError from '../utils/AppError.js';
import { sendNotification } from '../utils/sseManager.js';

export const createPost = async (userId, content, targetUserId) => {
  if (userId !== targetUserId) {
    const friendship = await FriendshipModel.findAcceptedByPair(
      userId,
      targetUserId,
    );
    if (!friendship) {
      throw new AppError('你只能貼文到自己的塗鴉牆或朋友的塗鴉牆', 403);
    }
  }

  return await PostModel.createPost(userId, content, targetUserId);
};

export const updatePost = async (user, postId, content) => {
  const post = await PostModel.findById(postId);
  if (!post) throw new AppError('留言不存在', 404);

  if (!PostPolicy.canEdit(user, post)) {
    throw new AppError('你沒有權限編輯這篇留言', 403);
  }

  return await PostModel.updatePost(postId, { content });
};

export const deletePost = async (user, postId) => {
  const post = await PostModel.findById(postId);
  if (!post) throw new AppError('留言不存在', 404);

  if (!PostPolicy.canDelete(user, post)) {
    throw new AppError('你沒有權限刪除這篇留言', 403);
  }

  return await PostModel.deleteById(postId);
};

export const toggleLike = async (operatorId, postId) => {
  const post = await PostModel.findById(postId);
  if (!post) throw new AppError('留言不存在', 404);

  const existingLike = await PostLikeModel.findUserLike(operatorId, postId);

  if (existingLike) {
    await PostLikeModel.deleteLike(operatorId, postId);
  } else {
    await PostLikeModel.createLike(operatorId, postId);

    // 按讚且不是按自己的讚，發送通知
    if (post.userId !== operatorId) {
      const operator = await UserModel.findById(operatorId);
      // 加上防呆，如果找不到 name 就用 username，再沒有就顯示 '有人'
      const displayName = operator?.name || operator?.username || '有人';

      sendNotification(post.userId, {
        type: 'NEW_LIKE',
        message: `${displayName} 剛剛對你的留言按了讚！`,
        postId: postId,
        timestamp: new Date(),
      });
    }
  }

  return !existingLike;
};
