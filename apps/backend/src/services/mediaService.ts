import MediaModel from '../models/mediaModel.js';
import { formatMedia } from '../utils/formatters.js';
import AppError from '../utils/AppError.js';
import { deleteFromS3 } from '../utils/s3Utils.js';
import type { MediaType } from '../generated/client.js';

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
    file: Express.Multer.File | (Express.MulterS3.File & { key?: string }),
    title?: string,
    description?: string,
  ) => {
    // multer-s3 會將 S3 key 存在 file.key
    const fileKey = (file as { key?: string }).key;
    if (!fileKey) {
      throw new AppError('上傳失敗：無法取得 S3 檔案 key', 500);
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
