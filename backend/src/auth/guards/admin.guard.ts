import {
  type CanActivate,
  type ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProblemException } from '../../common/http/problem.exception';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (request.user?.role !== 'ADMIN') {
      throw new ProblemException(
        'ADMIN_REQUIRED',
        '관리자 권한이 필요합니다.',
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
