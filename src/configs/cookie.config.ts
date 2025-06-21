import env from '@/env';
import { CookieOptions } from 'express';

export function cookieConfig({
  maxAge,
  sameSite = 'none',
  httpOnly = true,
  domain = env.COOKIE_DOMAIN,
  secure = true,
}: CookieOptions): CookieOptions {
  return {
    maxAge,
    sameSite,
    httpOnly,
    domain,
    secure,
  };
}