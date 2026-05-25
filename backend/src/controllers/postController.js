import PostModel from '../models/postModel.js';
import * as PostService from '../services/postService.js';
import { formatLikers } from '../utils/formatters.js';
import { sendSuccess } from '../utils/response.js';

export const getAllPosts = async (req, res) => {
  sendSuccess(res, 200, { posts: [] });
};

export const getPostLikers = async (req, res) => {
  const postId = req.params.id;
  const likes = await PostModel.getPostLikers(postId);
  const likers = likes.map(formatLikers);

  sendSuccess(res, 200, { count: likers.length, likers }, '取得按讚名單成功');
};

export const createPost = async (req, res) => {
  const { content, targetUserId } = req.body;
  const userId = req.user.id;

  const newPost = await PostService.createPost(userId, content, targetUserId);
  sendSuccess(res, 201, { post: newPost }, '留言發布成功');
};

export const updatePost = async (req, res) => {
  const postId = req.params.id;
  const { content } = req.body;

  await PostService.updatePost(req.user, postId, content);
  sendSuccess(res, 200, {}, '留言更新成功');
};

export const deletePost = async (req, res) => {
  const postId = req.params.id;
  await PostService.deletePost(req.user, postId);

  sendSuccess(res, 200, {}, '留言已成功刪除');
};

export const toggleLikePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  const isLiked = await PostService.toggleLike(userId, postId);
  const message = isLiked ? '已點讚' : '已取消點讚';

  sendSuccess(res, 200, { isLiked }, message);
};
