import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';
import { deleteFromS3 } from '../utils/s3Utils.js';

export const globalErrorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || '伺服器發生異常';
  // 如果是 AppError，或者是主動拋出的 4xx 錯誤，都算 Operational (預期內的業務阻擋)
  const isOperational = err.isOperational || err instanceof AppError;

  // 暫存錯誤訊息給 Pino Logger
  res.locals.errorMessage = message;

  if (req.file?.key) {
    deleteFromS3(req.file.key)
      .then(() =>
        logger.info(`[錯誤攔截] 孤兒檔案已從 S3 移除: ${req.file.key}`),
      )
      .catch((e) =>
        logger.error(e, `[錯誤攔截] 移除 S3 檔案失敗: ${req.file.key}`),
      );
  }

  if (isOperational && statusCode !== 500) {
    logger.warn({ errMessage: message, path: req.originalUrl });
  } else {
    logger.error({ err, path: req.originalUrl }, '🚨 [未預期系統崩潰]');
  }

  if (isOperational && statusCode !== 500) {
    return res.status(statusCode).json({
      success: false,
      message: message,
      errorCode: err.errorCode || null,
    });
  }

  return res.status(500).json({
    success: false,
    message: '伺服器發生異常，請稍後再試',
  });
};
