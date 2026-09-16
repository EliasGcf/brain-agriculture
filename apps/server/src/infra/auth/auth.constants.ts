import { CookieOptions } from 'express';

export const AUTH_COOKIE = 'access_token';
export const COOKIES_CONFIG: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'none',
  maxAge: 24 * 60 * 60 * 1000,
  path: '/',
};
