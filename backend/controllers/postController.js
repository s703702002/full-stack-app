import PostModel from '../models/postModel.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/response.js';
import { sendNotification } from '../utils/sseManager.js';

export const getAllPosts = async (req, res) => {
  const currentUserId = req.user.id;
  const posts = await PostModel.findAllWithAuthor(currentUserId);

  const formattedPosts = posts.map((post) => ({
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    userId: post.userId,
    username: post.author?.username,
    authorName: post.author?.name,
    likeCount: post._count.likes,
    isLikedByMe: post.likes.length > 0, // 如果陣列裡有東西，代表我有按讚！
  }));

  sendSuccess(res, 200, { posts: formattedPosts });
};

export const toggleLikePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  const post = await PostModel.findById(postId);
  if (!post) throw new AppError('留言不存在', 404);

  const { liked } = await PostModel.toggleLike(userId, postId);

  if (liked) {
    const targetUserId = post.userId;

    if (targetUserId !== userId) {
      sendNotification(targetUserId, {
        type: 'NEW_LIKE',
        message: `${req.user.name} 剛剛對你的留言按了讚！`,
        postId: postId,
        timestamp: new Date(),
      });
    }
  }

  const message = liked ? '已點讚' : '已取消點讚';
  sendSuccess(res, 200, { isLiked: liked }, message);
};

export const createPost = async (req, res) => {
  const { content } = req.body;
  const userId = req.user.id;

  if (!content) throw new AppError('留言內容不能為空', 400);

  const newPost = await PostModel.createPost(userId, content);
  sendSuccess(res, 201, { post: newPost }, '留言發布成功');
};

export const updatePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;
  const { content } = req.body;

  const post = await PostModel.findById(postId);

  if (!post) throw new AppError('留言不存在', 404);

  if (post.userId !== userId) {
    throw new AppError('你只能編輯自己的留言', 403);
  }

  await PostModel.updateContent(postId, content);

  sendSuccess(res, 200, {}, '留言更新成功');
};

export const deletePost = async (req, res) => {
  await PostModel.deleteById(req.params.id);
  sendSuccess(res, 200, {}, '管理員已成功刪除留言');
};

export const getPostLikers = async (req, res) => {
  const postId = Number(req.params.id);
  const likes = await PostModel.getPostLikers(postId);
  const likers = likes.map((like) => like.user);

  sendSuccess(res, 200, { count: likers.length, likers }, '取得按讚名單成功');
};
