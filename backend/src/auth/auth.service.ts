import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ProblemException } from '../common/http/problem.exception';
import type { Environment } from '../config/environment';
import { type AuthUserRecord, UsersService } from '../users/users.service';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import type { AuthenticatedUser } from './authenticated-user';

const BCRYPT_COST = 12;

interface JwtPayload {
  sub: string;
  role: UserRole;
}

export interface AuthResult {
  user: AuthUserRecord;
  token: string;
}

function invalidCredentials(): ProblemException {
  return new ProblemException(
    'INVALID_CREDENTIALS',
    '이메일 또는 비밀번호가 올바르지 않습니다.',
    HttpStatus.UNAUTHORIZED,
  );
}

function invalidSession(): ProblemException {
  return new ProblemException(
    'INVALID_SESSION',
    '유효하지 않은 로그인 세션입니다.',
    HttpStatus.UNAUTHORIZED,
  );
}

function isJwtPayload(value: unknown): value is JwtPayload {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const payload = value as Record<string, unknown>;
  return (
    typeof payload.sub === 'string' &&
    (payload.role === UserRole.USER || payload.role === UserRole.ADMIN)
  );
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Environment, true>,
  ) {}

  async register(input: RegisterDto): Promise<AuthResult> {
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
    const user = await this.users.create({
      email: input.email.trim().toLowerCase(),
      nickname: input.nickname.trim(),
      passwordHash,
    });

    return {
      user,
      token: await this.issueToken(user),
    };
  }

  async login(input: LoginDto): Promise<AuthResult> {
    const user = await this.users.findAuthByEmail(
      input.email.trim().toLowerCase(),
    );

    if (user === null) {
      throw invalidCredentials();
    }

    const passwordMatches = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw invalidCredentials();
    }

    return {
      user,
      token: await this.issueToken(user),
    };
  }

  async authenticateToken(token: string): Promise<AuthenticatedUser> {
    let payload: unknown;
    try {
      payload = await this.jwt.verifyAsync<Record<string, unknown>>(token, {
        secret: this.config.get('JWT_SECRET', { infer: true }),
      });
    } catch {
      throw invalidSession();
    }
    if (!isJwtPayload(payload)) {
      throw invalidSession();
    }
    const user = await this.users.findById(payload.sub);
    if (user === null) {
      throw invalidSession();
    }
    return user;
  }

  private async issueToken(user: AuthUserRecord): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
    };

    return this.jwt.signAsync(payload, {
      expiresIn: this.config.get('JWT_EXPIRES_IN_SECONDS', { infer: true }),
      secret: this.config.get('JWT_SECRET', { infer: true }),
    });
  }
}
