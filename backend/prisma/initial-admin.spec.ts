import { readInitialAdminConfig } from './initial-admin';

describe('initial administrator configuration', () => {
  it('requires all initial administrator secrets in production', () => {
    expect(() => readInitialAdminConfig({ NODE_ENV: 'production' })).toThrow(
      'INITIAL_ADMIN_EMAIL',
    );
  });

  it('normalizes a valid administrator identity', () => {
    expect(
      readInitialAdminConfig({
        NODE_ENV: 'production',
        INITIAL_ADMIN_EMAIL: ' Admin@TravelGuide.App ',
        INITIAL_ADMIN_PASSWORD: 'secure-admin-1234',
        INITIAL_ADMIN_NICKNAME: ' 운영 관리자 ',
      }),
    ).toEqual({
      email: 'admin@travelguide.app',
      password: 'secure-admin-1234',
      nickname: '운영 관리자',
    });
  });

  it('rejects weak credentials and allows an unconfigured development seed', () => {
    expect(readInitialAdminConfig({ NODE_ENV: 'development' })).toBeUndefined();
    expect(() =>
      readInitialAdminConfig({
        NODE_ENV: 'production',
        INITIAL_ADMIN_EMAIL: 'admin@travelguide.app',
        INITIAL_ADMIN_PASSWORD: 'onlyletters',
        INITIAL_ADMIN_NICKNAME: '관리자',
      }),
    ).toThrow('10-72 characters');
  });
});
