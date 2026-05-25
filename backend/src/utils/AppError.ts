class AppError extends Error {
  statusCode: number;
  success: boolean;
  errorCode: number | null;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    errorCode: number | null = null,
  ) {
    super(message);

    this.statusCode = statusCode;
    this.success = false;
    this.errorCode = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
