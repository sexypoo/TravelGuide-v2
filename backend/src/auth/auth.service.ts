import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ProblemException } from '../common/http/problem.exception';
import type { Environment } from '../config/environment';
import { type AuthUserRecord, UsersService } from '../users/users.service';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';

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
