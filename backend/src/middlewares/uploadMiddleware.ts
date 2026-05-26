import type { Request } from 'express';
import type { FileFilterCallback } from 'multer';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { extname } from '../utils/pathHelper.js';
import { s3Client } from '../utils/s3Utils.js';
import AppError from '../utils/AppError.js';
import { env } from '../utils/validateEnv.js';

const storage = multerS3({
  s3: s3Client,
  bucket: env.S3_BUCKET,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, `avatars/avatar-${uniqueSuffix}${ext}`);
  },
});

export const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('只允許上傳圖片檔案', 400));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
