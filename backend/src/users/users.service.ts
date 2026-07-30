import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, type UserRole } from '@prisma/client';
import { ProblemException } from '../common/http/problem.exception';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  nickname: string;
}

export interface AuthUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  nickname: string;
  role: UserRole;
  createdAt: Date;
}

export type UserIdentityRecord = Omit<AuthUserRecord, 'passwordHash'>;

function duplicateUserProblem(field: 'email' | 'nickname'): ProblemException {
  return field === 'email'
    ? new ProblemException(
        'EMAIL_ALREADY_EXISTS',
        '이미 가입된 이메일입니다.',
        HttpStatus.CONFLICT,
      )
    : new ProblemException(
        'NICKNAME_ALREADY_EXISTS',
        '이미 사용 중인 닉네임입니다.',
        HttpStatus.CONFLICT,
      );
}

function getUniqueTarget(
  error: Prisma.PrismaClientKnownRequestError,
): readonly string[] {
  const target = error.meta?.target;

  if (typeof target === 'string') {
    return [target];
  }

  if (Array.isArray(target)) {
    return target.filter((item): item is string => typeof item === 'string');
  }

  return [];
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateUserInput): Promise<AuthUserRecord> {
    const conflict = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: input.email }, { nickname: input.nickname }],
      },
      select: {
        email: true,
        nickname: true,
      },
    });

    if (conflict?.email === input.email) {
      throw duplicateUserProblem('email');
    }

    if (conflict?.nickname === input.nickname) {
      throw duplicateUserProblem('nickname');
    }

    try {
      return await this.prisma.user.create({
        data: input,
        select: {
          id: true,
          email: true,
          passwordHash: true,
          nickname: true,
          role: true,
          createdAt: true,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target = getUniqueTarget(error);
        throw duplicateUserProblem(
          target.includes('nickname') ? 'nickname' : 'email',
        );
      }

      throw error;
    }
  }

  async findAuthByEmail(email: string): Promise<AuthUserRecord | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        nickname: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async findById(id: string): Promise<UserIdentityRecord | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nickname: true,
        role: true,
        createdAt: true,
      },
    });
  }
}
