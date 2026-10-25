import { Injectable } from '@nestjs/common';
import { UserRole, VerificationStatus, VerificationType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { deriveQuestionStatus } from '../../questions/dto/question.response';
import type {
  AdminMetricsResponse,
  AdminSupplyResponse,
  AdminUserFunnelResponse,
} from './dto/admin-metrics.response';

function percentage(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

/** Step-over-step rate. Capped so inconsistent history can't exceed 100%. */
function stepRate(numerator: number, denominator: number): number {
  return Math.min(100, percentage(numerator, denominator));
}

function oneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function median(values: number[]): number | null {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  const upper = sorted[middle];
  if (upper === undefined) return null;
  const lower = sorted.length % 2 === 1 ? upper : (sorted[middle - 1] ?? upper);
  return oneDecimal((lower + upper) / 2);
}

/**
 * Verifications that were approved at least once. Only admin review writes
 * APPROVED today; EXPIRED/REVOKED are not written by any code path yet, so
 * they count only when a reviewer decision (`reviewedAt`) exists (ADR-051).
 */
const everApprovedVerification = {
  OR: [
    { status: VerificationStatus.APPROVED },
    {
      status: {
        in: [VerificationStatus.EXPIRED, VerificationStatus.REVOKED],
      },
      reviewedAt: { not: null },
    },
  ],
};

@Injectable()
export class AdminMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(now = new Date()): Promise<AdminMetricsResponse> {
    const [
      questions,
      contributorGroups,
      signedUpCount,
      appliedUsers,
      approvedUserTypes,
    ] = await Promise.all([
      this.prisma.question.findMany({
        where: { removedAt: null },
        select: {
          authorId: true,
          createdAt: true,
          status: true,
          expiresAt: true,
          acceptedAnswerId: true,
          author: { select: { role: true } },
          answers: {
            where: { removedAt: null },
            orderBy: { createdAt: 'asc' },
            take: 1,
            select: { createdAt: true },
          },
          _count: {
            select: { answers: { where: { removedAt: null } } },
          },
        },
      }),
      this.prisma.answer.groupBy({
        by: ['authorId'],
        where: {
          removedAt: null,
          authorKind: { in: ['LOCAL', 'BOTH'] },
          question: { removedAt: null },
        },
        _count: { _all: true },
      }),
      this.prisma.user.count({ where: { role: UserRole.USER } }),
      this.prisma.verification.findMany({
        where: { user: { role: UserRole.USER } },
        distinct: ['userId'],
        select: { userId: true },
      }),
      this.prisma.verification.findMany({
        where: { user: { role: UserRole.USER }, ...everApprovedVerification },
        distinct: ['userId', 'type'],
        select: { userId: true, type: true },
      }),
    ]);
    const users = await this.prisma.user.findMany({
      where: { id: { in: contributorGroups.map((item) => item.authorId) } },
      select: { id: true, nickname: true },
    });
    const nicknameById = new Map(users.map((user) => [user.id, user.nickname]));
    const delays = questions.flatMap((question) => {
      const first = question.answers[0];
      return first === undefined
        ? []
        : [(first.createdAt.getTime() - question.createdAt.getTime()) / 60_000];
    });
    const resolvedQuestionCount = questions.filter(
      (question) => question.status === 'RESOLVED',
    ).length;
    const acceptedQuestionCount = questions.filter(
      (question) =>
        question.status === 'RESOLVED' && question.acceptedAnswerId !== null,
    ).length;

    const memberQuestions = questions.filter(
      (question) => question.author.role === UserRole.USER,
    );
    const firstTopicCount = new Set(
      memberQuestions.map((question) => question.authorId),
    ).size;
    const answerReceivedCount = new Set(
      memberQuestions
        .filter((question) => question._count.answers > 0)
        .map((question) => question.authorId),
    ).size;
    const answerAcceptedCount = new Set(
      memberQuestions
        .filter(
          (question) =>
            question.status === 'RESOLVED' &&
            question.acceptedAnswerId !== null &&
            question._count.answers > 0,
        )
        .map((question) => question.authorId),
    ).size;
    const verificationAppliedCount = appliedUsers.length;
    const verificationApprovedCount = new Set(
      approvedUserTypes.map((item) => item.userId),
    ).size;
    const userFunnel: AdminUserFunnelResponse = {
      signedUpCount,
      verificationAppliedCount,
      verificationAppliedRate: stepRate(
        verificationAppliedCount,
        signedUpCount,
      ),
      verificationApprovedCount,
      verificationApprovedRate: stepRate(
        verificationApprovedCount,
        verificationAppliedCount,
      ),
      travelerApprovedCount: approvedUserTypes.filter(
        (item) => item.type === VerificationType.TRAVELER,
      ).length,
      localApprovedCount: approvedUserTypes.filter(
        (item) => item.type === VerificationType.LOCAL,
      ).length,
      firstTopicCount,
      firstTopicRate: stepRate(firstTopicCount, verificationApprovedCount),
      answerReceivedCount,
      answerReceivedRate: stepRate(answerReceivedCount, firstTopicCount),
      answerAcceptedCount,
      answerAcceptedRate: stepRate(answerAcceptedCount, answerReceivedCount),
    };

    const unansweredExpiredQuestionCount = questions.filter(
      (question) =>
        question._count.answers === 0 &&
        deriveQuestionStatus(question, now) === 'EXPIRED',
    ).length;
    const answerTotal = questions.reduce(
      (total, question) => total + question._count.answers,
      0,
    );
    const supply: AdminSupplyResponse = {
      unansweredExpiredQuestionCount,
      unansweredExpiredQuestionRate: percentage(
        unansweredExpiredQuestionCount,
        questions.length,
      ),
      averageAnswersPerAnsweredQuestion:
        delays.length === 0 ? null : oneDecimal(answerTotal / delays.length),
      medianFirstAnswerMinutes: median(delays),
    };

    return {
      generatedAt: now.toISOString(),
      questionCount: questions.length,
      answeredQuestionCount: delays.length,
      answeredQuestionRate: percentage(delays.length, questions.length),
      averageFirstAnswerMinutes:
        delays.length === 0
          ? null
          : Math.round(
              (delays.reduce((total, delay) => total + delay, 0) /
                delays.length) *
                10,
            ) / 10,
      answeredWithinTenMinutesRate: percentage(
        delays.filter((delay) => delay <= 10).length,
        delays.length,
      ),
      resolvedQuestionCount,
      resolutionRate: percentage(resolvedQuestionCount, questions.length),
      acceptedQuestionCount,
      acceptanceRate: percentage(acceptedQuestionCount, resolvedQuestionCount),
      localContributors: contributorGroups
        .map((item) => ({
          userId: item.authorId,
          nickname: nicknameById.get(item.authorId) ?? '탈퇴한 사용자',
          answerCount: item._count._all,
        }))
        .sort(
          (left, right) =>
            right.answerCount - left.answerCount ||
            left.nickname.localeCompare(right.nickname, 'ko'),
        ),
      userFunnel,
      supply,
    };
  }
}
