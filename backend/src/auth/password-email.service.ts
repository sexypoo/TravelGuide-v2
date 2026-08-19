import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProblemException } from '../common/http/problem.exception';
import type { Environment } from '../config/environment';

@Injectable()
export class PasswordEmailService {
  private readonly logger = new Logger(PasswordEmailService.name);

  constructor(private readonly config: ConfigService<Environment, true>) {}

  get configured(): boolean {
    return (
      this.config.get('RESEND_API_KEY', { infer: true }) !== undefined &&
      this.config.get('EMAIL_FROM', { infer: true }) !== undefined
    );
  }

  async sendReset(email: string, resetUrl: string): Promise<void> {
    const apiKey = this.config.get('RESEND_API_KEY', { infer: true });
    const from = this.config.get('EMAIL_FROM', { infer: true });
    if (apiKey === undefined || from === undefined) {
      throw unavailable();
    }

    let response: Response;
    try {
      response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'yeojju-password-recovery/1.0',
        },
        body: JSON.stringify({
          from,
          to: [email],
          subject: '여쭈어 비밀번호를 다시 설정해 주세요',
          text: [
            '여쭈어 비밀번호 재설정 요청을 받았습니다.',
            '아래 링크는 30분 동안 한 번만 사용할 수 있습니다.',
            resetUrl,
            '요청하지 않았다면 이 메일을 무시해 주세요.',
          ].join('\n\n'),
        }),
      });
    } catch {
      this.logger.error('Password reset email delivery request failed');
      throw unavailable();
    }

    if (!response.ok) {
      this.logger.error(
        `Password reset email delivery returned status ${response.status}`,
      );
      throw unavailable();
    }
  }
}

function unavailable(): ProblemException {
  return new ProblemException(
    'PASSWORD_EMAIL_UNAVAILABLE',
    '재설정 메일을 보낼 수 없습니다. 잠시 후 다시 시도해 주세요.',
    HttpStatus.SERVICE_UNAVAILABLE,
  );
}
