import type { Request, Response, CookieOptions } from 'express';
import { env } from '../utils/validateEnv.js';

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
};

export const getAccessToken = (req: Request): string | null =>
  req.cookies?.accessToken ?? null;

export const getRefreshToken = (req: Request): string | null =>
  req.cookies?.refreshToken ?? null;

export const getTempToken = (req: Request): string | null =>
  req.cookies?.tempToken ?? null;

export const setAccessTokenCookie = (res: Response, token: string): void => {
  res.cookie('accessToken', token, {
    ...baseCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie('refreshToken', token, {
    ...baseCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const setTempTokenCookie = (res: Response, token: string): void => {
  res.cookie('tempToken', token, {
    ...baseCookieOptions,
    maxAge: 5 * 60 * 1000,
    path: '/api/auth/login-2fa',
  });
};

export const clearTempTokenCookie = (res: Response): void => {
  res.clearCookie('tempToken');
};

export const clearAllAuthCookies = (res: Response): void => {
  res.clearCookie('connect.sid');
};
