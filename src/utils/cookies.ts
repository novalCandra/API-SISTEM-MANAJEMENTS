import type { CookieOptions, Request, Response } from 'express';
import { config } from '../config/env';

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: config.COOKIE_SECURE,
  sameSite: config.COOKIE_SAMESITE,
  domain: config.COOKIE_DOMAIN || undefined,
  path: '/api/auth',
};

export const setRefreshCookie = (res: Response, token: string, expiresAt: number): void => {
  res.cookie(config.COOKIE_NAME, token, { ...baseCookieOptions, expires: new Date(expiresAt) });
};

export const clearRefreshCookie = (res: Response): void => {
  res.clearCookie(config.COOKIE_NAME, baseCookieOptions);
};

export const readRefreshCookie = (req: Request): string | null => {
  const cookies = req.cookies as Record<string, string> | undefined;
  return cookies?.[config.COOKIE_NAME] ?? null;
};
