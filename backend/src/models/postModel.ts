import prisma from '../config/db.js';
import type { Prisma } from '../generated/client.js';

export type FindAllByUserIdResult = Awaited<
  ReturnType<typeof PostModel.findAllByUserId>
>;

export type GetPostLikersResult = Awaited<
  ReturnType<typeof PostModel.getPostLikers>
>;

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
        author: { select: { name: true, avatarUrl: true } },
        likes: { select: { userId: true } },
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
          select: { id: true, username: true, name: true, avatarUrl: true },
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
