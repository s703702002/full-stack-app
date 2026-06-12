import type { Request, Response, NextFunction } from 'express';
import type { ZodError, ZodObject } from 'zod';
import AppError from '../utils/AppError.js';

const validate = (schema: ZodObject) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      const zodError = err as ZodError;
      const errorMessage = zodError.issues.map((e) => e.message).join(', ');
      next(new AppError(`欄位驗證失敗: ${errorMessage}`, 400));
    }
  };
};

export default validate;
