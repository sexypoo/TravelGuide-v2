import {
  AUTH_COOKIE_NAME,
  createAuthCookieOptions,
  createClearCookieOptions,
} from './auth-cookie';

describe('auth cookie options', () => {
  it('uses the fixed cookie name', () => {
    expect(AUTH_COOKIE_NAME).toBe('tg_access');
  });

  it('keeps development cookies httpOnly without Secure', () => {
    expect(createAuthCookieOptions('development', 3_600)).toMatchObject({
      httpOnly: true,
      maxAge: 3_600_000,
      path: '/',
      sameSite: 'lax',
      secure: false,
    });
  });

  it('uses Secure consistently when setting and clearing in production', () => {
    expect(createAuthCookieOptions('production', 3_600).secure).toBe(true);
    expect(createClearCookieOptions('production').secure).toBe(true);
  });
});
