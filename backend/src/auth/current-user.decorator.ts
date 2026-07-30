import {
  createParamDecorator,
  type ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProblemException } from '../common/http/problem.exception';
import type { AuthenticatedUser } from './authenticated-user';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.user === undefined) {
      throw new ProblemException(
        'AUTHENTICATION_REQUIRED',
        '로그인이 필요합니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return request.user;
  },
);
