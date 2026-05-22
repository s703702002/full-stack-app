import prisma from '../config/db.js';

const PostModel = {
  // ==========================================
  // 🔍 1. 查詢類 (Read)
  // ==========================================

  findById: async (id) => {
    return await prisma.post.findUnique({
      where: { id: id },
    });
  },

  findAllByUserId: async (profileUserId) => {
    return await prisma.post.findMany({
      where: { targetUserId: profileUserId },
      include: {
        author: {
          select: { name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  getPostLikers: async (postId) => {
    return await prisma.postLike.findMany({
      where: { postId: postId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, username: true, name: true, avatarUrl: true },
        },
      },
    });
  },

  // ==========================================
  // 🛠️ 2. 通用資料操作 (Generic CRUD)
  // ==========================================

  createPost: async (userId, content, targetUserId = userId) => {
    return await prisma.post.create({
      data: {
        userId: userId,
        targetUserId: targetUserId,
        content: content,
      },
    });
  },

  updatePost: async (id, data) => {
    return await prisma.post.update({
      where: { id: id },
      data,
    });
  },

  deleteById: async (id) => {
    return await prisma.post.delete({
      where: { id: id },
    });
  },
};

export default PostModel;
