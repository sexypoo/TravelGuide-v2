import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { AdminMetricsResponse } from './dto/admin-metrics.response';

function percentage(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

@Injectable()
export class AdminMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(now = new Date()): Promise<AdminMetricsResponse> {
    const [questions, contributorGroups] = await Promise.all([
      this.prisma.question.findMany({
        where: { removedAt: null },
        select: {
          createdAt: true,
          status: true,
          acceptedAnswerId: true,
          answers: {
            where: { removedAt: null },
            orderBy: { createdAt: 'asc' },
            take: 1,
            select: { createdAt: true },
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
    };
  }
}
