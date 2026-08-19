import { ConfigService } from '@nestjs/config';
import type { Environment } from '../config/environment';
import { OAuthCredentialCipher } from './oauth-credential-cipher';

describe('OAuthCredentialCipher', () => {
  const config = new ConfigService<Environment, true>({
    OAUTH_TOKEN_ENCRYPTION_KEY: '7f'.repeat(32),
  });
  const cipher = new OAuthCredentialCipher(config);

  it('round-trips a credential without retaining plaintext', () => {
    const plaintext = 'apple-refresh-token-private';
    const ciphertext = cipher.encrypt(plaintext);

    expect(ciphertext).toMatch(/^v1\./u);
    expect(ciphertext).not.toContain(plaintext);
    expect(cipher.decrypt(ciphertext)).toBe(plaintext);
  });

  it('rejects tampered authenticated ciphertext', () => {
    const ciphertext = cipher.encrypt('refresh-token');
    const [version, iv, tag, payload] = ciphertext.split('.');
    if (
      version === undefined ||
      iv === undefined ||
      tag === undefined ||
      payload === undefined
    ) {
      throw new Error('Expected versioned ciphertext');
    }
    const tamperedTag = `${tag.startsWith('A') ? 'B' : 'A'}${tag.slice(1)}`;
    const tampered = [version, iv, tamperedTag, payload].join('.');

    expect(() => cipher.decrypt(tampered)).toThrow();
  });
});
