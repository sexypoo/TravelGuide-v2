import { validateServerEnvironment } from './server';

describe('validateServerEnvironment', () => {
  it('normalizes an HTTP or HTTPS origin', () => {
    expect(
      validateServerEnvironment({
        NODE_ENV: 'test',
        API_INTERNAL_URL: 'https://api.travel.example',
      }),
    ).toEqual({ apiInternalUrl: 'https://api.travel.example' });
  });

  it.each([
    undefined,
    'ftp://api.travel.example',
    'https://user:pass@api.travel.example',
    'https://api.travel.example/private',
    'https://api.travel.example?token=secret',
  ])('rejects an unsafe internal API URL: %s', (value) => {
    expect(() =>
      validateServerEnvironment({ NODE_ENV: 'test', API_INTERNAL_URL: value }),
    ).toThrow();
  });
});
