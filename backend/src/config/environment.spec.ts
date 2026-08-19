import { validateEnvironment } from './environment';

const validProduction = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://travelguide:secret@db:5432/travelguide',
  API_PORT: '3001',
  WEB_ORIGIN: 'https://travel.example',
  JWT_SECRET: 'a-secure-production-secret-over-32-characters',
  JWT_EXPIRES_IN: '24h',
  STORAGE_DRIVER: 's3',
  S3_REGION: 'ap-northeast-2',
  S3_BUCKET: 'travelguide-private',
};

describe('environment validation hardening', () => {
  it('accepts an exact HTTPS production origin and strong secret', () => {
    expect(validateEnvironment(validProduction)).toMatchObject({
      NODE_ENV: 'production',
      WEB_ORIGIN: 'https://travel.example',
    });
  });

  it('rejects weak production secrets and insecure public origins', () => {
    expect(() =>
      validateEnvironment({ ...validProduction, JWT_SECRET: 'short-secret' }),
    ).toThrow('at least 32');
    expect(() =>
      validateEnvironment({
        ...validProduction,
        WEB_ORIGIN: 'http://travel.example',
      }),
    ).toThrow('must use HTTPS');
  });

  it('rejects credentials, paths, queries, and wildcard-like origins', () => {
    for (const origin of [
      'https://user:pass@travel.example',
      'https://travel.example/app',
      'https://travel.example?origin=*',
    ]) {
      expect(() =>
        validateEnvironment({ ...validProduction, WEB_ORIGIN: origin }),
      ).toThrow('must be an origin');
    }
  });

  it('requires complete private S3 configuration', () => {
    expect(() =>
      validateEnvironment({ ...validProduction, S3_BUCKET: '' }),
    ).toThrow('S3_REGION and S3_BUCKET');
    expect(() =>
      validateEnvironment({
        ...validProduction,
        S3_ACCESS_KEY_ID: 'access-key',
      }),
    ).toThrow('must be provided together');
  });

  it('normalizes Railway service and bucket variables', () => {
    expect(
      validateEnvironment({
        ...validProduction,
        API_PORT: undefined,
        PORT: '8080',
        WEB_ORIGIN: undefined,
        FRONTEND_URL: 'https://travelguide-web.up.railway.app',
        S3_REGION: undefined,
        S3_BUCKET: undefined,
        AWS_DEFAULT_REGION: 'auto',
        AWS_S3_BUCKET_NAME: 'travelguide-files-a1b2c3',
        AWS_ENDPOINT_URL: 'https://storage.railway.app',
        AWS_S3_URL_STYLE: 'virtual',
        AWS_ACCESS_KEY_ID: 'railway-access-key',
        AWS_SECRET_ACCESS_KEY: 'railway-secret-key',
      }),
    ).toMatchObject({
      API_PORT: 8080,
      WEB_ORIGIN: 'https://travelguide-web.up.railway.app',
      S3_REGION: 'auto',
      S3_BUCKET: 'travelguide-files-a1b2c3',
      S3_ENDPOINT: 'https://storage.railway.app',
      S3_URL_STYLE: 'virtual',
      S3_ACCESS_KEY_ID: 'railway-access-key',
      S3_SECRET_ACCESS_KEY: 'railway-secret-key',
    });
  });

  it('rejects malformed S3-compatible endpoint settings', () => {
    expect(() =>
      validateEnvironment({
        ...validProduction,
        S3_ENDPOINT: 'https://storage.example/private',
      }),
    ).toThrow('S3_ENDPOINT must be an origin');
    expect(() =>
      validateEnvironment({ ...validProduction, S3_URL_STYLE: 'invalid' }),
    ).toThrow('S3_URL_STYLE must be virtual or path');
  });

  it('keeps legacy AWS region and bucket aliases compatible', () => {
    expect(
      validateEnvironment({
        ...validProduction,
        S3_REGION: undefined,
        S3_BUCKET: undefined,
        AWS_REGION: 'ap-northeast-2',
        AWS_S3_BUCKET: 'legacy-private-bucket',
      }),
    ).toMatchObject({
      S3_REGION: 'ap-northeast-2',
      S3_BUCKET: 'legacy-private-bucket',
    });
  });

  it('requires complete email and social provider secret groups', () => {
    expect(() =>
      validateEnvironment({ ...validProduction, RESEND_API_KEY: 're_test' }),
    ).toThrow('RESEND_API_KEY, EMAIL_FROM');
    expect(() =>
      validateEnvironment({
        ...validProduction,
        GOOGLE_OAUTH_CLIENT_ID: 'google-client',
      }),
    ).toThrow('GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET');
    expect(() =>
      validateEnvironment({
        ...validProduction,
        APPLE_OAUTH_CLIENT_ID: 'apple-client',
        APPLE_OAUTH_TEAM_ID: 'team',
        APPLE_OAUTH_KEY_ID: 'key',
      }),
    ).toThrow('APPLE_OAUTH_PRIVATE_KEY');
  });

  it('normalizes escaped Apple private-key newlines', () => {
    expect(
      validateEnvironment({
        ...validProduction,
        APPLE_OAUTH_CLIENT_ID: 'apple-client',
        APPLE_OAUTH_TEAM_ID: 'team',
        APPLE_OAUTH_KEY_ID: 'key',
        APPLE_OAUTH_PRIVATE_KEY: 'line-one\\nline-two',
      }).APPLE_OAUTH_PRIVATE_KEY,
    ).toBe('line-one\nline-two');
  });
});
