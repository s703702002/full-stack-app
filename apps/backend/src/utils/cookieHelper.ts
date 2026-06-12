import type { Response } from 'express';

export const clearAllAuthCookies = (res: Response): void => {
  res.clearCookie('connect.sid');
};
