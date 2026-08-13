import MediaModel from '../models/mediaModel.js';
import { formatMedia } from '../utils/formatters.js';
import AppError from '../utils/AppError.js';
import { deleteFromS3 } from '../utils/s3Utils.js';
import type { MediaType } from '../generated/client.js';
import { MAX_MEDIA_PER_USER } from '../constants/media.js';

export const mediaService = {
  getUserMedias: async (
    userId: string,
    page = 1,
    limit = 30,
    mediaType?: MediaType,
  ) => {
    const { medias, total } = await MediaModel.findAllByUserId(
      userId,
      page,
      limit,
      mediaType,
    );

    const formattedMedias = await Promise.all(
      medias.map((media) => formatMedia(media)),
    );

    return {
      items: formattedMedias,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    };
  },

  createMediaFromFile: async (
    userId: string,
    file: Express.Multer.File,
    title?: string,
    description?: string,
  ) => {
    const fileKey = file.key;
    if (!fileKey) {
      throw new AppError('上傳失敗：無法取得 S3 檔案 key', 500);
    }

    const currentCount = await MediaModel.countByUserId(userId);
    if (currentCount >= MAX_MEDIA_PER_USER) {
      try {
        await deleteFromS3(fileKey);
      } catch (err) {
        console.error('超額上傳清理 S3 檔案失敗:', err);
      }
      throw new AppError(`已達上傳上限（最多 ${MAX_MEDIA_PER_USER} 個媒體項目）`, 400);
    }

    const mediaType: MediaType = file.mimetype.startsWith('video/')
      ? 'VIDEO'
      : 'IMAGE';

    const media = await MediaModel.createMedia({
      userId,
      title: title?.trim(),
      description: description?.trim(),
      fileKey,
      mediaType,
      mimeType: file.mimetype,
      size: file.size,
    });

    return await formatMedia(media);
  },

  deleteMedia: async (currentUserId: string, mediaId: string) => {
    const media = await MediaModel.findById(mediaId);
    if (!media) {
      throw new AppError('找不到該媒體項目', 404);
    }

    if (media.userId !== currentUserId) {
      throw new AppError('無權限刪除此媒體項目', 403);
    }

    try {
      await deleteFromS3(media.fileKey);
    } catch (err) {
      console.error('刪除 S3 檔案時出錯:', err);
    }

    await MediaModel.deleteById(mediaId);
    return { success: true };
  },
};
