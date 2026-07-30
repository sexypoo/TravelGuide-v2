import type { CookieOptions } from 'express';
import type { NodeEnvironment } from '../config/environment';

export const AUTH_COOKIE_NAME = 'tg_access';

export function createAuthCookieOptions(
  nodeEnvironment: NodeEnvironment,
  expiresInSeconds: number,
): CookieOptions {
  return {
    httpOnly: true,
    maxAge: expiresInSeconds * 1_000,
    path: '/',
    sameSite: 'lax',
    secure: nodeEnvironment === 'production',
  };
}

export function createClearCookieOptions(
  nodeEnvironment: NodeEnvironment,
): CookieOptions {
  return {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: nodeEnvironment === 'production',
  };
}
