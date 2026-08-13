import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';
import { deleteFromS3 } from '../utils/s3Utils.js';

const isAppError = (err: unknown): err is AppError => err instanceof AppError;

const multerErrorMessageMap: Record<string, string> = {
  LIMIT_FILE_SIZE: '檔案大小超過限制',
  LIMIT_UNEXPECTED_FILE: '不支援的檔案欄位或超過檔案數量限制',
  LIMIT_FILE_COUNT: '上傳檔案數量超過限制',
  LIMIT_PART_COUNT: '上傳欄位數量超過限制',
  LIMIT_FIELD_KEY: '欄位名稱過長',
  LIMIT_FIELD_VALUE: '欄位內容過長',
  LIMIT_FIELD_COUNT: '欄位數量超過限制',
};

// 把各種已知的第三方錯誤,統一轉換成 AppError,讓後續邏輯不用個別處理
const normalizeError = (err: AppError | Error): AppError | Error => {
  if (err instanceof multer.MulterError) {
    const message =
      multerErrorMessageMap[err.code] ?? `檔案上傳錯誤: ${err.message}`;
    return new AppError(message, 400);
  }
  return err;
};

export const globalErrorHandler = (
  rawErr: AppError | Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const err = normalizeError(rawErr);

  const statusCode = isAppError(err) ? err.statusCode : 500;
  const message = err.message || '伺服器發生異常';
  const isOperational = isAppError(err) ? err.isOperational : false;
  const data = isAppError(err) ? err.data : null;

  res.locals.errorMessage = message;

  if (req.file?.key) {
    const key = req.file.key;
    deleteFromS3(key)
      .then(() => logger.info(`[錯誤攔截] 孤兒檔案已從 S3 移除: ${key}`))
      .catch((e) => logger.error(e, `[錯誤攔截] 移除 S3 檔案失敗: ${key}`));
  }

  if (!isOperational || statusCode === 500) {
    logger.error({ err, path: req.originalUrl }, '🚨 [未預期系統崩潰]');
  }

  if (isOperational && statusCode !== 500) {
    return res.status(statusCode).json({
      success: false,
      message,
      data: data,
    });
  }

  return res.status(500).json({
    success: false,
    message: '伺服器發生異常，請稍後再試',
  });
};
