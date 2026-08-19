import { HttpStatus, Injectable } from '@nestjs/common';
import { type AuthProvider, Prisma, type UserRole } from '@prisma/client';
import { createHash } from 'node:crypto';
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
  passwordHash: string | null;
  nickname: string;
  role: UserRole;
  sessionVersion: number;
  createdAt: Date;
}

const authUserSelect = {
  id: true,
  email: true,
  passwordHash: true,
  nickname: true,
  role: true,
  sessionVersion: true,
  createdAt: true,
} as const;

export type UserIdentityRecord = Omit<AuthUserRecord, 'passwordHash'>;

export interface OwnProfileRecord {
  id: string;
  email: string;
  nickname: string;
  bio: string | null;
  travelStyles: TravelStyle[];
  avatarObjectKey: string | null;
  role: UserRole;
  hasPassword: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicProfileRecord {
  id: string;
  nickname: string;
  bio: string | null;
  avatarObjectKey: string | null;
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
          sessionVersion: true,
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
        sessionVersion: true,
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
        sessionVersion: true,
        createdAt: true,
      },
    });
  }

  async createPasswordResetToken(
    email: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<{ email: string } | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true },
    });
    if (user === null || user.passwordHash === null) return null;

    await this.prisma.$transaction([
      this.prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      }),
      this.prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      }),
    ]);
    return { email: user.email };
  }

  async consumePasswordResetToken(
    tokenHash: string,
    passwordHash: string,
    now: Date,
  ): Promise<boolean> {
    return this.prisma.$transaction(async (transaction) => {
      const token = await transaction.passwordResetToken.findUnique({
        where: { tokenHash },
        select: { id: true, userId: true, expiresAt: true, usedAt: true },
      });
      if (
        token === null ||
        token.usedAt !== null ||
        token.expiresAt.getTime() <= now.getTime()
      ) {
        return false;
      }

      const consumed = await transaction.passwordResetToken.updateMany({
        where: { id: token.id, usedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now },
      });
      if (consumed.count !== 1) return false;

      await transaction.user.update({
        where: { id: token.userId },
        data: { passwordHash, sessionVersion: { increment: 1 } },
      });
      await transaction.passwordResetToken.updateMany({
        where: { userId: token.userId, usedAt: null },
        data: { usedAt: now },
      });
      return true;
    });
  }

  async invalidatePasswordResetToken(tokenHash: string): Promise<void> {
    await this.prisma.passwordResetToken.updateMany({
      where: { tokenHash, usedAt: null },
      data: { usedAt: new Date() },
    });
  }

  async findOrCreateSocialUser(input: {
    provider: AuthProvider;
    providerUserId: string;
    email: string;
    nicknameHint?: string;
    allowCreate: boolean;
    refreshTokenCiphertext?: string;
  }): Promise<AuthUserRecord> {
    return this.prisma.$transaction(async (transaction) => {
      const linked = await transaction.authIdentity.findUnique({
        where: {
          provider_providerUserId: {
            provider: input.provider,
            providerUserId: input.providerUserId,
          },
        },
        select: { id: true, user: { select: authUserSelect } },
      });
      if (linked !== null) {
        if (input.refreshTokenCiphertext !== undefined) {
          await transaction.authIdentity.update({
            where: { id: linked.id },
            data: { refreshTokenCiphertext: input.refreshTokenCiphertext },
          });
        }
        return linked.user;
      }

      let user = await transaction.user.findUnique({
        where: { email: input.email },
        select: authUserSelect,
      });
      if (user === null) {
        if (!input.allowCreate) {
          throw new ProblemException(
            'SOCIAL_ACCOUNT_NOT_FOUND',
            '연결된 계정이 없습니다. 먼저 계정을 만들어 주세요.',
            HttpStatus.NOT_FOUND,
          );
        }
        user = await transaction.user.create({
          data: {
            email: input.email,
            nickname: await this.availableSocialNickname(
              transaction,
              input.nicknameHint,
              input.providerUserId,
            ),
          },
          select: authUserSelect,
        });
      }

      await transaction.authIdentity.create({
        data: {
          userId: user.id,
          provider: input.provider,
          providerUserId: input.providerUserId,
          refreshTokenCiphertext: input.refreshTokenCiphertext,
        },
      });
      return user;
    });
  }

  private async availableSocialNickname(
    transaction: Prisma.TransactionClient,
    hint: string | undefined,
    providerUserId: string,
  ): Promise<string> {
    const normalized = hint?.replace(/\s+/g, ' ').trim().slice(0, 20) ?? '';
    const base = normalized.length >= 2 ? normalized : '제주여행자';
    const first = await transaction.user.findUnique({
      where: { nickname: base },
      select: { id: true },
    });
    if (first === null) return base;

    const fingerprint = createHash('sha256')
      .update(providerUserId)
      .digest('hex')
      .slice(0, 4);
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const suffix = attempt === 0 ? fingerprint : `${fingerprint}${attempt}`;
      const candidate = `${base.slice(0, 20 - suffix.length)}${suffix}`;
      const conflict = await transaction.user.findUnique({
        where: { nickname: candidate },
        select: { id: true },
      });
      if (conflict === null) return candidate;
    }
    throw new ProblemException(
      'SOCIAL_NICKNAME_UNAVAILABLE',
      '계정을 만들 수 없습니다. 잠시 후 다시 시도해 주세요.',
      HttpStatus.CONFLICT,
    );
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
        avatarObjectKey: true,
        passwordHash: true,
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

    const { passwordHash, ...profile } = user;
    return {
      ...profile,
      hasPassword: passwordHash !== null,
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
          avatarObjectKey: true,
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
          avatarObjectKey: true,
          passwordHash: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      const { passwordHash, ...profile } = user;
      return {
        ...profile,
        hasPassword: passwordHash !== null,
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
