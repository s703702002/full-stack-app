import AppError from '../utils/AppError.js';
import { deleteFile, existsSync } from '../utils/fsHelper.js';

const handlePrismaDuplicateError = () => {
  // P2002 是 Prisma 的「唯一值衝突 (Unique Constraint)」錯誤碼
  return new AppError('這個帳號名稱已經被使用過了', 409);
};

export const globalErrorHandler = (err, req, res, _next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // 🚀 在全域攔截 Prisma 的特定錯誤碼並翻譯
  if (err.code === 'P2002') error = handlePrismaDuplicateError();

  if (err instanceof AppError || error.statusCode !== 500) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errorCode: error.errorCode || null,
    });
  }

  console.error('💥 [未預期系統錯誤]:', err);

  // 如果請求失敗了，且這次請求有透過 Multer 上傳檔案
  if (req.file) {
    const filePath = req.file.path;
    try {
      if (existsSync(filePath)) {
        deleteFile(filePath);
        console.log(`[自動清理] 由於請求失敗，已刪除孤兒檔案: ${filePath}`);
      }
    } catch (cleanupError) {
      console.error('[自動清理] 刪除失敗:', cleanupError);
    }
  }

  // 回傳給前端「罐頭訊息」，絕不洩漏系統細節
  return res.status(500).json({
    success: false,
    message: '伺服器發生異常，請稍後再試',
  });
};
