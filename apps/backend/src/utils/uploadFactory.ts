import type { Request } from 'express';
import type { FileFilterCallback } from 'multer';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { extname } from '../utils/pathHelper.js';
import { s3Client } from '../utils/s3Utils.js';
import AppError from '../utils/AppError.js';
import { env } from '../utils/validateEnv.js';
import { getAuthUser } from './requestHelper.js';

type AllowedMimePrefix = 'image/' | 'video/';

interface CreateUploaderOptions {
  folder: string; // 例如 'avatars' 或 'medias'
  filePrefix: string; // 例如 'avatar' 或 'media'
  allowedMimeTypes: AllowedMimePrefix[];
  maxFileSizeMB: number;
  errorMessage: string;
}

export function createFileFilter(
  allowedMimeTypes: AllowedMimePrefix[],
  errorMessage: string,
) {
  return (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const isAllowed = allowedMimeTypes.some((prefix) =>
      file.mimetype.startsWith(prefix),
    );
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new AppError(errorMessage, 400));
    }
  };
}

export function createUploader({
  folder,
  filePrefix,
  allowedMimeTypes,
  maxFileSizeMB,
  errorMessage,
}: CreateUploaderOptions) {
  const storage = multerS3({
    s3: s3Client,
    bucket: env.S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (_req, file, cb) => {
      const userId = getAuthUser(_req).id;
      const ext = extname(file.originalname);
      cb(null, `${folder}/${filePrefix}-${userId}-${Date.now()}${ext}`);
    },
  });

  const fileFilter = createFileFilter(allowedMimeTypes, errorMessage);

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: maxFileSizeMB * 1024 * 1024 },
  });
}
