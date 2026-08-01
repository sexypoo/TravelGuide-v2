import { AdminMetricsService } from './admin-metrics.service';

describe('AdminMetricsService', () => {
  it('derives lifecycle and response-time metrics from visible records', async () => {
    const base = new Date('2026-08-02T00:00:00.000Z');
    const prisma = {
      question: {
        findMany: jest.fn().mockResolvedValue([
          {
            createdAt: base,
            status: 'RESOLVED',
            acceptedAnswerId: 'answer-1',
            answers: [{ createdAt: new Date(base.getTime() + 5 * 60_000) }],
          },
          {
            createdAt: base,
            status: 'OPEN',
            acceptedAnswerId: null,
            answers: [{ createdAt: new Date(base.getTime() + 15 * 60_000) }],
          },
          {
            createdAt: base,
            status: 'OPEN',
            acceptedAnswerId: null,
            answers: [],
          },
        ]),
      },
      answer: {
        groupBy: jest
          .fn()
          .mockResolvedValue([{ authorId: 'local-1', _count: { _all: 3 } }]),
      },
      user: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 'local-1', nickname: '제주바람' }]),
      },
    };

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
    const prisma = {
      question: { findMany: jest.fn().mockResolvedValue([]) },
      answer: { groupBy: jest.fn().mockResolvedValue([]) },
      user: { findMany: jest.fn().mockResolvedValue([]) },
    };
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
    });
  });
});
