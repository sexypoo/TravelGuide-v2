import { AdminMetricsService } from './admin-metrics.service';

const base = new Date('2026-08-02T00:00:00.000Z');
const later = new Date(base.getTime() + 24 * 60 * 60_000);

function minutesAfter(minutes: number): Date {
  return new Date(base.getTime() + minutes * 60_000);
}

interface QuestionRow {
  authorId: string;
  createdAt: Date;
  status: 'OPEN' | 'RESOLVED' | 'EXPIRED';
  expiresAt: Date;
  acceptedAnswerId: string | null;
  author: { role: 'USER' | 'ADMIN' };
  answers: Array<{ createdAt: Date }>;
  _count: { answers: number };
}

function question(overrides: Partial<QuestionRow> = {}): QuestionRow {
  return {
    authorId: 'traveler-1',
    createdAt: base,
    status: 'OPEN',
    expiresAt: later,
    acceptedAnswerId: null,
    author: { role: 'USER' },
    answers: [],
    _count: { answers: 0 },
    ...overrides,
  };
}

function answered(minutes: number, count = 1): Partial<QuestionRow> {
  return {
    answers: [{ createdAt: minutesAfter(minutes) }],
    _count: { answers: count },
  };
}

interface PrismaMock {
  question: { findMany: jest.Mock };
  answer: { groupBy: jest.Mock };
  user: { findMany: jest.Mock; count: jest.Mock };
  verification: { findMany: jest.Mock };
}

function prismaMock(input: {
  questions?: QuestionRow[];
  signedUp?: number;
  applied?: string[];
  approved?: Array<{ userId: string; type: 'TRAVELER' | 'LOCAL' }>;
}): PrismaMock {
  return {
    question: { findMany: jest.fn().mockResolvedValue(input.questions ?? []) },
    answer: { groupBy: jest.fn().mockResolvedValue([]) },
    user: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(input.signedUp ?? 0),
    },
    verification: {
      findMany: jest
        .fn()
        .mockResolvedValueOnce(
          (input.applied ?? []).map((userId) => ({ userId })),
        )
        .mockResolvedValueOnce(input.approved ?? []),
    },
  };
}

describe('AdminMetricsService', () => {
  it('derives lifecycle and response-time metrics from visible records', async () => {
    const prisma = {
      ...prismaMock({
        questions: [
          question({
            status: 'RESOLVED',
            acceptedAnswerId: 'answer-1',
            ...answered(5),
          }),
          question(answered(15)),
          question(),
        ],
      }),
      answer: {
        groupBy: jest
          .fn()
          .mockResolvedValue([{ authorId: 'local-1', _count: { _all: 3 } }]),
      },
    };
    prisma.user.findMany.mockResolvedValue([
      { id: 'local-1', nickname: '제주바람' },
    ]);

    await expect(
      new AdminMetricsService(prisma as never).get(base),
    ).resolves.toMatchObject({
      questionCount: 3,
      answeredQuestionCount: 2,
      answeredQuestionRate: 66.7,
      averageFirstAnswerMinutes: 10,
      answeredWithinTenMinutesRate: 50,
      resolvedQuestionCount: 1,
      resolutionRate: 33.3,
      acceptedQuestionCount: 1,
      acceptanceRate: 100,
      localContributors: [
        { userId: 'local-1', nickname: '제주바람', answerCount: 3 },
      ],
    });
  });

  it('uses stable empty metric values', async () => {
    const prisma = prismaMock({});
    await expect(
      new AdminMetricsService(prisma as never).get(),
    ).resolves.toMatchObject({
      questionCount: 0,
      answeredQuestionRate: 0,
      averageFirstAnswerMinutes: null,
      answeredWithinTenMinutesRate: 0,
      resolutionRate: 0,
      acceptanceRate: 0,
      localContributors: [],
      userFunnel: {
        signedUpCount: 0,
        verificationAppliedCount: 0,
        verificationAppliedRate: 0,
        verificationApprovedCount: 0,
        verificationApprovedRate: 0,
        travelerApprovedCount: 0,
        localApprovedCount: 0,
        firstTopicCount: 0,
        firstTopicRate: 0,
        answerReceivedCount: 0,
        answerReceivedRate: 0,
        answerAcceptedCount: 0,
        answerAcceptedRate: 0,
      },
      supply: {
        unansweredExpiredQuestionCount: 0,
        unansweredExpiredQuestionRate: 0,
        averageAnswersPerAnsweredQuestion: null,
        medianFirstAnswerMinutes: null,
      },
    });
  });

  it('counts each user once per funnel step and excludes admin topics', async () => {
    const prisma = prismaMock({
      signedUp: 5,
      applied: ['traveler-1', 'traveler-2', 'local-1', 'both-1'],
      approved: [
        { userId: 'traveler-1', type: 'TRAVELER' },
        { userId: 'traveler-2', type: 'TRAVELER' },
        { userId: 'both-1', type: 'TRAVELER' },
        { userId: 'both-1', type: 'LOCAL' },
      ],
      questions: [
        question({ authorId: 'traveler-1', ...answered(4, 2) }),
        question({
          authorId: 'traveler-1',
          status: 'RESOLVED',
          acceptedAnswerId: 'answer-2',
          ...answered(6, 3),
        }),
        question({ authorId: 'traveler-2' }),
        question({ authorId: 'admin-1', author: { role: 'ADMIN' } }),
        question({
          authorId: 'admin-1',
          author: { role: 'ADMIN' },
          acceptedAnswerId: 'answer-3',
          ...answered(2),
        }),
      ],
    });

    const result = await new AdminMetricsService(prisma as never).get(base);

    expect(result.userFunnel).toEqual({
      signedUpCount: 5,
      verificationAppliedCount: 4,
      verificationAppliedRate: 80,
      verificationApprovedCount: 3,
      verificationApprovedRate: 75,
      travelerApprovedCount: 3,
      localApprovedCount: 1,
      firstTopicCount: 2,
      firstTopicRate: 66.7,
      answerReceivedCount: 1,
      answerReceivedRate: 50,
      answerAcceptedCount: 1,
      answerAcceptedRate: 100,
    });
    // Question KPIs still include every visible topic (ADR-025).
    expect(result.questionCount).toBe(5);
  });

  it('does not count an accepted step when the accepted answer was removed or the topic is not resolved', async () => {
    const prisma = prismaMock({
      questions: [
        question({
          authorId: 'traveler-1',
          status: 'RESOLVED',
          acceptedAnswerId: 'removed-answer',
        }),
        question({ authorId: 'traveler-2', acceptedAnswerId: 'answer-4' }),
      ],
    });

    const result = await new AdminMetricsService(prisma as never).get(base);

    expect(result.userFunnel.answerReceivedCount).toBe(0);
    expect(result.userFunnel.answerAcceptedCount).toBe(0);
  });

  it('filters signups and verifications to non-admin users, including approvals that later expired or were revoked', async () => {
    const prisma = prismaMock({});
    await new AdminMetricsService(prisma as never).get(base);

    expect(prisma.user.count).toHaveBeenCalledWith({
      where: { role: 'USER' },
    });
    expect(prisma.question.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { removedAt: null } }),
    );
    expect(prisma.verification.findMany).toHaveBeenNthCalledWith(1, {
      where: { user: { role: 'USER' } },
      distinct: ['userId'],
      select: { userId: true },
    });
    expect(prisma.verification.findMany).toHaveBeenNthCalledWith(2, {
      where: {
        user: { role: 'USER' },
        OR: [
          { status: 'APPROVED' },
          {
            status: { in: ['EXPIRED', 'REVOKED'] },
            reviewedAt: { not: null },
          },
        ],
      },
      distinct: ['userId', 'type'],
      select: { userId: true, type: true },
    });
  });

  it('caps step rates at 100 when history skips a step', async () => {
    const prisma = prismaMock({
      signedUp: 2,
      applied: ['traveler-1'],
      approved: [],
      questions: [
        question({ authorId: 'traveler-1' }),
        question({ authorId: 'traveler-2' }),
      ],
    });

    const result = await new AdminMetricsService(prisma as never).get(base);

    expect(result.userFunnel.firstTopicCount).toBe(2);
    expect(result.userFunnel.firstTopicRate).toBe(0);
    expect(result.userFunnel.verificationAppliedRate).toBe(50);

    const skipped = prismaMock({
      signedUp: 2,
      applied: ['traveler-1'],
      approved: [{ userId: 'traveler-1', type: 'TRAVELER' }],
      questions: [
        question({ authorId: 'traveler-1' }),
        question({ authorId: 'traveler-2' }),
      ],
    });
    const capped = await new AdminMetricsService(skipped as never).get(base);
    expect(capped.userFunnel.firstTopicRate).toBe(100);
  });

  it('reports unanswered expired topics, answers per topic, and median first answer', async () => {
    const prisma = prismaMock({
      questions: [
        question(answered(3, 1)),
        question(answered(9, 2)),
        question(answered(30, 4)),
        question({ status: 'EXPIRED' }),
        question({ expiresAt: minutesAfter(-1) }),
        question(),
        question({ status: 'EXPIRED', ...answered(50, 1) }),
      ],
    });

    const result = await new AdminMetricsService(prisma as never).get(base);

    expect(result.supply).toEqual({
      unansweredExpiredQuestionCount: 2,
      unansweredExpiredQuestionRate: 28.6,
      averageAnswersPerAnsweredQuestion: 2,
      medianFirstAnswerMinutes: 19.5,
    });
  });

  it('uses the middle delay for an odd number of answered topics', async () => {
    const prisma = prismaMock({
      questions: [
        question(answered(12.25)),
        question(answered(1)),
        question(answered(40)),
      ],
    });

    const result = await new AdminMetricsService(prisma as never).get(base);

    expect(result.supply.medianFirstAnswerMinutes).toBe(12.3);
    expect(result.supply.averageAnswersPerAnsweredQuestion).toBe(1);
  });
});
