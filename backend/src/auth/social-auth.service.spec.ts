import { ConfigService } from '@nestjs/config';
import { generateKeyPairSync } from 'node:crypto';
import type { Environment } from '../config/environment';
import { OAuthCredentialCipher } from './oauth-credential-cipher';
import { SocialAuthService } from './social-auth.service';

describe('SocialAuthService Apple revocation', () => {
  const { privateKey } = generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
  });
  const config = new ConfigService<Environment, true>({
    WEB_ORIGIN: 'https://travel.example',
    JWT_SECRET: 'test-jwt-secret',
    APPLE_OAUTH_CLIENT_ID: 'kr.travelguide.web',
    APPLE_OAUTH_TEAM_ID: 'TEAM123456',
    APPLE_OAUTH_KEY_ID: 'KEY1234567',
    APPLE_OAUTH_PRIVATE_KEY: privateKey
      .export({
        format: 'pem',
        type: 'pkcs8',
      })
      .toString(),
    OAUTH_TOKEN_ENCRYPTION_KEY: '2a'.repeat(32),
  });
  const cipher = new OAuthCredentialCipher(config);
  const service = new SocialAuthService(
    {} as never,
    {} as never,
    config,
    cipher,
  );

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('decrypts and sends the refresh token to the Apple revocation endpoint', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 200 }));

    await service.revokeAppleRefreshToken(
      cipher.encrypt('private-apple-refresh-token'),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'https://appleid.apple.com/auth/revoke',
      expect.objectContaining({ method: 'POST' }),
    );
    const request = fetchMock.mock.calls[0]?.[1];
    const body = request?.body;
    if (!(body instanceof URLSearchParams)) {
      throw new Error('Expected URLSearchParams revocation body');
    }
    expect(body.get('token')).toBe('private-apple-refresh-token');
    expect(body.get('client_secret')).toMatch(/^[^.]+\.[^.]+\.[^.]+$/u);
  });

  it('keeps local deletion retryable when Apple rejects revocation', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 503 }));

    await expect(
      service.revokeAppleRefreshToken(cipher.encrypt('refresh-token')),
    ).rejects.toMatchObject({
      code: 'ACCOUNT_DELETION_PROVIDER_FAILED',
      status: 503,
    });
  });
});
