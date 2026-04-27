class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errorCode = errorCode;

    // 標記這是我們預期內的「操作錯誤 (Operational Error)」，例如密碼錯誤、找不到資料
    // 用來區分預期外的「程式 Bug (Programming Error)」
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
