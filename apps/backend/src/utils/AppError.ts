class AppError extends Error {
  statusCode: number;
  success: boolean;
  isOperational: boolean;
  data: Record<string, unknown> | null;

  constructor(
    message: string,
    statusCode: number,
    data: Record<string, unknown> | null = null,
  ) {
    super(message);

    this.statusCode = statusCode;
    this.success = false;
    this.data = data;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
