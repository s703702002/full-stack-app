import PostModel from '../models/postModel.js';
import UserModel from '../models/userModel.js';
import AppError from '../utils/AppError.js';
import { sendNotification } from '../utils/sseManager.js';

export const createPost = async (userId, content) => {
  if (!content) throw new AppError('留言內容不能為空', 400);
  return await PostModel.createPost(userId, { content });
};

export const updatePost = async (userId, postId, content) => {
  if (!content) throw new AppError('留言內容不能為空', 400);

  const post = await PostModel.findById(postId);
  if (!post) throw new AppError('留言不存在', 404);

  if (post.userId !== userId) {
    throw new AppError('你只能編輯自己的留言', 403);
  }

  return await PostModel.updatePost(postId, { content });
};

export const deletePost = async (postId) => {
  const post = await PostModel.findById(postId);
  if (!post) throw new AppError('留言不存在', 404);

  await PostModel.deleteById(postId);
};

export const toggleLike = async (operatorId, postId) => {
  const post = await PostModel.findById(postId);
  if (!post) throw new AppError('留言不存在', 404);

  const { liked } = await PostModel.toggleLike(operatorId, postId);

  // 按讚且不是按自己的讚，發送通知
  if (liked && post.userId !== operatorId) {
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

  return liked;
};
