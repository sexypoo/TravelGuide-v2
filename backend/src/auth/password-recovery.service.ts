import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';
import { ProblemException } from '../common/http/problem.exception';
import type { Environment } from '../config/environment';
import { UsersService } from '../users/users.service';
import { PasswordEmailService } from './password-email.service';

const BCRYPT_COST = 12;
const RESET_TTL_MS = 30 * 60 * 1000;

function tokenHash(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class PasswordRecoveryService {
  constructor(
    private readonly users: UsersService,
    private readonly email: PasswordEmailService,
    private readonly config: ConfigService<Environment, true>,
  ) {}

  get configured(): boolean {
    return this.email.configured;
  }

  async requestReset(email: string): Promise<void> {
    if (!this.email.configured) {
      throw new ProblemException(
        'PASSWORD_EMAIL_UNAVAILABLE',
        '재설정 메일을 보낼 수 없습니다. 잠시 후 다시 시도해 주세요.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const token = randomBytes(32).toString('base64url');
    const hash = tokenHash(token);
    const target = await this.users.createPasswordResetToken(
      email,
      hash,
      new Date(Date.now() + RESET_TTL_MS),
    );
    if (target === null) return;

    const resetUrl = new URL(
      '/auth/reset-password',
      this.config.get('WEB_ORIGIN', { infer: true }),
    );
    resetUrl.searchParams.set('token', token);
    try {
      await this.email.sendReset(target.email, resetUrl.toString());
    } catch (error: unknown) {
      await this.users.invalidatePasswordResetToken(hash);
      throw error;
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
    const changed = await this.users.consumePasswordResetToken(
      tokenHash(token),
      passwordHash,
      new Date(),
    );
    if (!changed) {
      throw new ProblemException(
        'PASSWORD_RESET_TOKEN_INVALID',
        '재설정 링크가 만료되었거나 이미 사용되었습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
