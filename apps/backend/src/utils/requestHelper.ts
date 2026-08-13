import type { AuthUser } from '../types/auth.js';

export const getAuthUser = (req: Express.Request): AuthUser => {
  if (!req.user) throw new Error('未登入');
  return req.user;
};
