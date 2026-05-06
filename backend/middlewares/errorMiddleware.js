import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';
import { deleteFromS3 } from '../utils/s3Utils.js';

const handlePrismaDuplicateError = () => {
  // P2002 是 Prisma 的「唯一值衝突 (Unique Constraint)」錯誤碼
  return new AppError('這個帳號名稱已經被使用過了', 409);
};

export const globalErrorHandler = (err, req, res, _next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  res.locals.errorMessage = error.message;

  // 全域攔截 Prisma 的特定錯誤碼並翻譯
  if (err.code === 'P2002') error = handlePrismaDuplicateError();

  if (err instanceof AppError || error.statusCode !== 500) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errorCode: error.errorCode || null,
    });
  }

  if (err.isOperational) {
    logger.warn(
      { errMessage: err.message, path: req.originalUrl },
      '⚠️ [業務邏輯阻擋]',
    );
  } else {
    logger.error({ err, path: req.originalUrl }, '🚨 [未預期系統錯誤]');
  }

  // 如果請求失敗了，且這次請求有透過 Multer 上傳檔案
  if (req.file?.key) {
    deleteFromS3(req.file.key)
      .then(() => logger.info(`[錯誤攔截] 孤兒檔案已從 S3 移除`))
      .catch((e) => logger.error(e, '[錯誤攔截] 移除失敗'));
  }

  // 回傳給前端「罐頭訊息」，絕不洩漏系統細節
  return res.status(500).json({
    success: false,
    message: '伺服器發生異常，請稍後再試',
  });
};
