import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ProblemException } from '../common/http/problem.exception';
import type { Environment } from '../config/environment';
import { UsersService } from '../users/users.service';
import { AUTH_COOKIE_NAME } from './auth-cookie';
import type { AuthenticatedUser } from './authenticated-user';

interface JwtPayload {
  sub: string;
  role: UserRole;
  sessionVersion: number;
}

function extractJwtFromCookie(request: Request): string | null {
  const cookies: unknown = request.cookies;

  if (typeof cookies !== 'object' || cookies === null) {
    return null;
  }

  const token: unknown = (cookies as Record<string, unknown>)[AUTH_COOKIE_NAME];
  return typeof token === 'string' ? token : null;
}

function isJwtPayload(value: unknown): value is JwtPayload {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return (
    typeof payload.sub === 'string' &&
    Number.isInteger(payload.sessionVersion) &&
    (payload.role === UserRole.USER || payload.role === UserRole.ADMIN)
  );
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService<Environment, true>,
    private readonly users: UsersService,
  ) {
    super({
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromExtractors([extractJwtFromCookie]),
      secretOrKey: config.get('JWT_SECRET', { infer: true }),
    });
  }

  async validate(payload: unknown): Promise<AuthenticatedUser> {
    if (!isJwtPayload(payload)) {
      throw new ProblemException(
        'INVALID_SESSION',
        '유효하지 않은 로그인 세션입니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = await this.users.findById(payload.sub);
    if (user === null) {
      throw new ProblemException(
        'INVALID_SESSION',
        '유효하지 않은 로그인 세션입니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (user.sessionVersion !== payload.sessionVersion) {
      throw new ProblemException(
        'INVALID_SESSION',
        '유효하지 않은 로그인 세션입니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
