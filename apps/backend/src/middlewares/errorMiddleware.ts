import type { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';
import { deleteFromS3 } from '../utils/s3Utils.js';

const isAppError = (err: unknown): err is AppError => err instanceof AppError;

export const globalErrorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
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
