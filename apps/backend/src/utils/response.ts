import type { Response } from 'express';

export const sendSuccess = (
  res: Response,
  statusCode = 200,
  payload = {},
  message = 'Success',
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data: payload,
  });
};
