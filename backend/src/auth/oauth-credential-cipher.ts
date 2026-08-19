import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import type { Environment } from '../config/environment';

const CIPHER_VERSION = 'v1';
const IV_BYTES = 12;

@Injectable()
export class OAuthCredentialCipher {
  constructor(private readonly config: ConfigService<Environment, true>) {}

  encrypt(value: string): string {
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv('aes-256-gcm', this.key(), iv);
    const ciphertext = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ]);
    return [
      CIPHER_VERSION,
      iv.toString('base64url'),
      cipher.getAuthTag().toString('base64url'),
      ciphertext.toString('base64url'),
    ].join('.');
  }

  decrypt(value: string): string {
    const [version, encodedIv, encodedTag, encodedCiphertext, extra] =
      value.split('.');
    if (
      version !== CIPHER_VERSION ||
      encodedIv === undefined ||
      encodedTag === undefined ||
      encodedCiphertext === undefined ||
      extra !== undefined
    ) {
      throw new Error('Unsupported OAuth credential ciphertext');
    }
    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.key(),
      Buffer.from(encodedIv, 'base64url'),
    );
    decipher.setAuthTag(Buffer.from(encodedTag, 'base64url'));
    return Buffer.concat([
      decipher.update(Buffer.from(encodedCiphertext, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
  }

  private key(): Buffer {
    const configured = this.config.get('OAUTH_TOKEN_ENCRYPTION_KEY', {
      infer: true,
    });
    if (configured === undefined) {
      throw new Error('OAuth credential encryption is not configured');
    }
    return Buffer.from(configured, 'hex');
  }
}
