import { HttpStatus, Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { ProblemException } from '../common/http/problem.exception';
import { PrismaService } from '../prisma/prisma.service';
import type { RoomAccessResponse } from './room-access.types';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class RoomAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async getAccess(
    user: AuthenticatedUser,
    destinationId: string,
    now = new Date(),
  ): Promise<RoomAccessResponse> {
    if (user.role === 'ADMIN') {
      return {
        status: 'AVAILABLE',
        labelKo: '입장 가능',
        canViewContent: true,
        canAskQuestion: false,
        canAnswer: false,
      };
    }

    const [traveler, local, pending] = await Promise.all([
      this.prisma.verification.findFirst({
        where: {
          userId: user.id,
          destinationId,
          type: 'TRAVELER',
          status: 'APPROVED',
          startsAt: { lte: new Date(now.getTime() + DAY_MS) },
          endsAt: { gte: new Date(now.getTime() - DAY_MS) },
        },
        select: { id: true },
      }),
      this.prisma.verification.findFirst({
        where: {
          userId: user.id,
          destinationId,
          type: 'LOCAL',
          status: 'APPROVED',
          expiresAt: { gt: now },
        },
        select: { id: true },
      }),
      this.prisma.verification.findFirst({
        where: { userId: user.id, destinationId, status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        select: { type: true },
      }),
    ]);

    if (traveler !== null || local !== null) {
      return {
        status: 'AVAILABLE',
        labelKo: '입장 가능',
        canViewContent: true,
        canAskQuestion: traveler !== null,
        canAnswer: local !== null,
      };
    }

    if (pending?.type === 'TRAVELER') {
      return {
        status: 'TRAVELER_PENDING',
        labelKo: '여행자 심사 중',
        canViewContent: false,
        canAskQuestion: false,
        canAnswer: false,
      };
    }

    if (pending?.type === 'LOCAL') {
      return {
        status: 'LOCAL_PENDING',
        labelKo: '현지인 심사 중',
        canViewContent: false,
        canAskQuestion: false,
        canAnswer: false,
      };
    }

    return {
      status: 'VERIFICATION_REQUIRED',
      labelKo: '인증 필요',
      canViewContent: false,
      canAskQuestion: false,
      canAnswer: false,
    };
  }

  async assertCanViewContent(
    user: AuthenticatedUser,
    destinationId: string,
  ): Promise<void> {
    if (!(await this.getAccess(user, destinationId)).canViewContent) {
      throw new ProblemException(
        'ROOM_ACCESS_DENIED',
        '유효한 여행자 또는 현지인 인증이 필요합니다.',
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
