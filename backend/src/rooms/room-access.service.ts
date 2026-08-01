import { HttpStatus, Injectable } from '@nestjs/common';
import type { RoomParticipantKind } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { ProblemException } from '../common/http/problem.exception';
import { PrismaService } from '../prisma/prisma.service';
import type { RoomAccessResponse } from './room-access.types';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface ParticipantAnswerCapability {
  kind: RoomParticipantKind;
  verifiedAt: Date;
}

export interface RoomParticipantCapability {
  kind: RoomParticipantKind;
}

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
        canChat: false,
        canCreateTopic: false,
        canAskQuestion: false,
        canAnswer: false,
        participantKind: null,
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
      const participantKind: RoomParticipantKind =
        traveler !== null && local !== null
          ? 'BOTH'
          : traveler !== null
            ? 'TRAVELER'
            : 'LOCAL';
      return {
        status: 'AVAILABLE',
        labelKo: '입장 가능',
        canViewContent: true,
        canChat: true,
        canCreateTopic: true,
        canAskQuestion: true,
        canAnswer: true,
        participantKind,
      };
    }

    if (pending?.type === 'TRAVELER') {
      return {
        status: 'TRAVELER_PENDING',
        labelKo: '여행자 심사 중',
        canViewContent: false,
        canChat: false,
        canCreateTopic: false,
        canAskQuestion: false,
        canAnswer: false,
        participantKind: null,
      };
    }

    if (pending?.type === 'LOCAL') {
      return {
        status: 'LOCAL_PENDING',
        labelKo: '현지인 심사 중',
        canViewContent: false,
        canChat: false,
        canCreateTopic: false,
        canAskQuestion: false,
        canAnswer: false,
        participantKind: null,
      };
    }

    return {
      status: 'VERIFICATION_REQUIRED',
      labelKo: '인증 필요',
      canViewContent: false,
      canChat: false,
      canCreateTopic: false,
      canAskQuestion: false,
      canAnswer: false,
      participantKind: null,
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

  async assertCanAskQuestion(
    user: AuthenticatedUser,
    destinationId: string,
  ): Promise<void> {
    await this.assertCanParticipate(user, destinationId);
  }

  async assertCanParticipate(
    user: AuthenticatedUser,
    destinationId: string,
    now = new Date(),
  ): Promise<RoomParticipantCapability> {
    const access = await this.getAccess(user, destinationId, now);
    if (!access.canChat || access.participantKind === null) {
      throw new ProblemException(
        'ROOM_PARTICIPANT_VERIFICATION_REQUIRED',
        '현재 유효한 여행자 또는 현지인 인증이 필요합니다.',
        HttpStatus.FORBIDDEN,
      );
    }
    return { kind: access.participantKind };
  }

  async assertCanAnswer(
    user: AuthenticatedUser,
    destinationId: string,
    now = new Date(),
  ): Promise<ParticipantAnswerCapability> {
    const access = await this.getAccess(user, destinationId, now);
    if (!access.canAnswer || access.participantKind === null) {
      throw new ProblemException(
        'PARTICIPANT_VERIFICATION_REQUIRED',
        '현재 유효한 여행자 또는 현지인 인증이 필요합니다.',
        HttpStatus.FORBIDDEN,
      );
    }
    const verification = await this.prisma.verification.findFirst({
      where: {
        userId: user.id,
        destinationId,
        status: 'APPROVED',
        reviewedAt: { not: null },
        OR: [
          {
            type: 'TRAVELER',
            startsAt: { lte: new Date(now.getTime() + DAY_MS) },
            endsAt: { gte: new Date(now.getTime() - DAY_MS) },
          },
          { type: 'LOCAL', expiresAt: { gt: now } },
        ],
      },
      orderBy: { reviewedAt: 'desc' },
      select: { reviewedAt: true },
    });
    if (verification === null || verification.reviewedAt === null) {
      throw new ProblemException(
        'PARTICIPANT_VERIFICATION_REQUIRED',
        '현재 유효한 여행자 또는 현지인 인증이 필요합니다.',
        HttpStatus.FORBIDDEN,
      );
    }
    return {
      kind: access.participantKind,
      verifiedAt: verification.reviewedAt,
    };
  }
}
