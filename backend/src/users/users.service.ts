import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, type UserRole } from '@prisma/client';
import { ProblemException } from '../common/http/problem.exception';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import { normalizeTravelStyles, type TravelStyle } from './travel-styles';

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

export interface OwnProfileRecord {
  id: string;
  email: string;
  nickname: string;
  bio: string | null;
  travelStyles: TravelStyle[];
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicProfileRecord {
  id: string;
  nickname: string;
  bio: string | null;
  createdAt: Date;
  verifications: Array<{
    reviewedAt: Date | null;
    destination: { id: string; slug: string; nameKo: string };
  }>;
  stats: {
    answerCount: number;
    acceptedAnswerCount: number;
  };
}

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

  async getOwnProfile(id: string): Promise<OwnProfileRecord> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nickname: true,
        bio: true,
        travelStyles: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (user === null) {
      throw new ProblemException(
        'USER_NOT_FOUND',
        '사용자를 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      ...user,
      travelStyles: normalizeTravelStyles(user.travelStyles),
    };
  }

  async getPublicProfile(id: string): Promise<PublicProfileRecord> {
    const now = new Date();
    const [user, answerCount, acceptedAnswerCount] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          nickname: true,
          bio: true,
          createdAt: true,
          verifications: {
            where: {
              type: 'LOCAL',
              status: 'APPROVED',
              expiresAt: { gt: now },
            },
            orderBy: { reviewedAt: 'desc' },
            take: 1,
            select: {
              reviewedAt: true,
              destination: { select: { id: true, slug: true, nameKo: true } },
            },
          },
        },
      }),
      this.prisma.answer.count({
        where: { authorId: id, removedAt: null },
      }),
      this.prisma.answer.count({
        where: {
          authorId: id,
          removedAt: null,
          acceptedForQuestion: {
            is: { removedAt: null },
          },
        },
      }),
    ]);

    if (user === null) {
      throw new ProblemException(
        'USER_NOT_FOUND',
        '사용자를 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      ...user,
      stats: { answerCount, acceptedAnswerCount },
    };
  }

  async updateProfile(
    id: string,
    input: UpdateProfileDto,
  ): Promise<OwnProfileRecord> {
    if (input.nickname !== undefined) {
      const nicknameOwner = await this.prisma.user.findFirst({
        where: {
          nickname: input.nickname,
          NOT: { id },
        },
        select: { id: true },
      });

      if (nicknameOwner !== null) {
        throw duplicateUserProblem('nickname');
      }
    }

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...(input.nickname === undefined ? {} : { nickname: input.nickname }),
          ...(input.bio === undefined
            ? {}
            : { bio: input.bio === '' ? null : input.bio }),
          ...(input.travelStyles === undefined
            ? {}
            : { travelStyles: [...new Set(input.travelStyles)] }),
        },
        select: {
          id: true,
          email: true,
          nickname: true,
          bio: true,
          travelStyles: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return {
        ...user,
        travelStyles: normalizeTravelStyles(user.travelStyles),
      };
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw duplicateUserProblem('nickname');
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new ProblemException(
          'USER_NOT_FOUND',
          '사용자를 찾을 수 없습니다.',
          HttpStatus.NOT_FOUND,
        );
      }

      throw error;
    }
  }
}
