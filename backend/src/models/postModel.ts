import prisma from '../config/db.js';
import type { Prisma } from '../generated/client.js';

const likerSelect = {
  id: true,
  username: true,
  name: true,
  avatarUrl: true,
} as const;

type LikeSelectArgs = {
  include: {
    user: { select: typeof likerSelect };
  };
};

export type LikeWithUser = Prisma.PostLikeGetPayload<LikeSelectArgs>;

const PostModel = {
  findById: async (id: string) => {
    return await prisma.post.findUnique({
      where: { id: id },
    });
  },

  findAllByUserId: async (profileUserId: string) => {
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

  getPostLikers: async (postId: string) => {
    return await prisma.postLike.findMany({
      where: { postId: postId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: likerSelect,
        },
      },
    });
  },

  createPost: async (
    userId: string,
    content: string,
    targetUserId = userId,
  ) => {
    return await prisma.post.create({
      data: {
        userId: userId,
        targetUserId: targetUserId,
        content: content,
      },
    });
  },

  updatePost: async (id: string, data: Prisma.PostUpdateInput) => {
    return await prisma.post.update({
      where: { id: id },
      data,
    });
  },

  deleteById: async (id: string) => {
    return await prisma.post.delete({
      where: { id: id },
    });
  },
};

export default PostModel;
