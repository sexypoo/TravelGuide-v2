import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { ProblemException } from '../http/problem.exception';
import type { Environment } from '../../config/environment';
import {
  RATE_LIMIT_CATEGORY,
  type RateLimitCategory,
} from './rate-limit.decorator';
import { RateLimitService } from './rate-limit.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly limiter: RateLimitService,
    private readonly config: ConfigService<Environment, true>,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    if (this.config.get('NODE_ENV', { infer: true }) === 'test') return true;
    const category = this.reflector.getAllAndOverride<RateLimitCategory>(
      RATE_LIMIT_CATEGORY,
      [context.getHandler(), context.getClass()],
    );
    if (category === undefined) return true;
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const principal =
      category === 'LOGIN' || category === 'PASSWORD_RESET'
        ? (request.ip ?? 'unknown')
        : (request.user?.id ?? request.ip ?? 'unknown');
    const result = this.limiter.consume(category, principal);
    if (result.allowed) return true;
    response.setHeader('Retry-After', String(result.retryAfterSeconds));
    throw new ProblemException(
      'RATE_LIMIT_EXCEEDED',
      `요청이 너무 많습니다. ${result.retryAfterSeconds}초 후 다시 시도해 주세요.`,
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
