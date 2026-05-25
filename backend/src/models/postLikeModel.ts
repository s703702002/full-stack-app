import prisma from '../config/db.js';

const PostLikeModel = {
  findLikersByPostId: async (postId: string) => {
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

  findUserLike: async (userId: string, postId: string) => {
    return await prisma.postLike.findUnique({
      where: {
        userId_postId: { userId: userId, postId: postId },
      },
    });
  },

  createLike: async (userId: string, postId: string) => {
    return await prisma.postLike.create({
      data: { userId: userId, postId: postId },
    });
  },

  deleteLike: async (userId: string, postId: string) => {
    return await prisma.postLike.delete({
      where: {
        userId_postId: { userId: userId, postId: postId },
      },
    });
  },
};

export default PostLikeModel;
