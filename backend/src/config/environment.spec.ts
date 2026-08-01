import { validateEnvironment } from './environment';

const validProduction = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://travelguide:secret@db:5432/travelguide',
  API_PORT: '3001',
  WEB_ORIGIN: 'https://travel.example',
  JWT_SECRET: 'a-secure-production-secret-over-32-characters',
  JWT_EXPIRES_IN: '24h',
  STORAGE_DRIVER: 's3',
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
});
