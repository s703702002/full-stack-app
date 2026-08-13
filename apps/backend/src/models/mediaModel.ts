import prisma from '../config/db.js';
import type { Prisma, MediaType } from '../generated/client.js';

const MediaModel = {
  findById: async (id: string) => {
    return await prisma.media.findUnique({
      where: { id },
    });
  },

  findAllByUserId: async (userId: string, page = 1, limit = 30, mediaType?: MediaType) => {
    const skip = (page - 1) * limit;
    const whereCondition: Prisma.MediaWhereInput = {
      userId,
      ...(mediaType ? { mediaType } : {}),
    };

    const [medias, total] = await prisma.$transaction([
      prisma.media.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.media.count({ where: whereCondition }),
    ]);

    return { medias, total };
  },

  countByUserId: async (userId: string) => {
    return await prisma.media.count({
      where: { userId },
    });
  },

  createMedia: async (data: {
    userId: string;
    title?: string;
    description?: string;
    fileKey: string;
    mediaType: MediaType;
    mimeType?: string;
    size?: number;
  }) => {
    return await prisma.media.create({
      data: {
        userId: data.userId,
        title: data.title,
        description: data.description,
        fileKey: data.fileKey,
        mediaType: data.mediaType,
        mimeType: data.mimeType,
        size: data.size,
      },
    });
  },

  deleteById: async (id: string) => {
    return await prisma.media.delete({
      where: { id },
    });
  },
};

export default MediaModel;
