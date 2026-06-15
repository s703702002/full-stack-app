import type { Response } from 'express';
import type { ApiResponse } from '@full-stack-app/shared';

export const sendSuccess = <T>(
  res: Response,
  statusCode = 200,
  payload: T = {} as T,
  message = 'Success',
) => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data: payload,
  };
  res.status(statusCode).json(response);
};
