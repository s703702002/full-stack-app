import prisma from '../config/db.js';

const PostModel = {
  // ==========================================
  // 🔍 1. 查詢類 (Read)
  // ==========================================

  findById: async (id) => {
    return await prisma.post.findUnique({
      where: { id: Number(id) },
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
                where: { userId: Number(currentUserId) },
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  getPostLikers: async (postId) => {
    return await prisma.postLike.findMany({
      where: { postId: Number(postId) },
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
        userId: Number(userId),
        ...data,
      },
    });
  },

  /**
   * 通用更新貼文
   * @param {number|string} id - 貼文 ID
   * @param {Prisma.PostUpdateInput} data - 允許更新的欄位資料
   */
  updatePost: async (id, data) => {
    return await prisma.post.update({
      where: { id: Number(id) },
      data,
    });
  },

  deleteById: async (id) => {
    return await prisma.post.delete({
      where: { id: Number(id) },
    });
  },
};

export default PostModel;
