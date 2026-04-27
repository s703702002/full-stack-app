import prisma from '../config/db.js';

const PostModel = {
  findAllWithAuthor: async (currentUserId) => {
    return await prisma.post.findMany({
      include: {
        author: {
          select: { username: true, name: true },
        },
        _count: {
          select: { likes: true }, // 🚀 Prisma 超強大招：自動幫你 Count 關聯表數量！
        },
        likes: {
          where: { userId: currentUserId }, // 🚀 順便檢查「我」有沒有按過這篇的讚
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  findById: async (id) => {
    return await prisma.post.findUnique({
      where: { id: Number(id) },
    });
  },

  createPost: async (userId, content) => {
    return await prisma.post.create({
      data: {
        userId: Number(userId),
        content: content,
      },
    });
  },

  updateContent: async (id, content) => {
    return await prisma.post.update({
      where: { id: Number(id) },
      data: { content: content },
    });
  },

  deleteById: async (id) => {
    return await prisma.post.delete({
      where: { id: Number(id) },
    });
  },

  toggleLike: async (userId, postId) => {
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: { userId: Number(userId), postId: Number(postId) },
      },
    });

    if (existingLike) {
      await prisma.postLike.delete({
        where: {
          userId_postId: { userId: Number(userId), postId: Number(postId) },
        },
      });
      return { liked: false };
    } else {
      await prisma.postLike.create({
        data: { userId: Number(userId), postId: Number(postId) },
      });
      return { liked: true };
    }
  },

  getPostLikers: async (postId) => {
    return await prisma.postLike.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, username: true, name: true },
        },
      },
    });
  },
};

export default PostModel;
