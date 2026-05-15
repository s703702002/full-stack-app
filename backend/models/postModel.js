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

  findAllWithDetails: async (currentUserId = null) => {
    return await prisma.post.findMany({
      include: {
        author: {
          select: { username: true, name: true, avatarUrl: true },
        },
        _count: {
          select: { likes: true },
        },
        // 只有當 currentUserId 有值時，才去查詢「我」有沒有按讚
        ...(currentUserId
          ? {
              likes: {
                where: { userId: currentUserId },
              },
            }
          : {}),
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

  createPost: async (userId, data) => {
    return await prisma.post.create({
      data: {
        userId: userId,
        ...data,
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
