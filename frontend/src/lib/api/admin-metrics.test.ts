import { parseAdminMetrics } from './admin-metrics';

const payload = {
  generatedAt: '2026-08-02T00:00:00.000Z',
  questionCount: 10,
  answeredQuestionCount: 8,
  answeredQuestionRate: 80,
  averageFirstAnswerMinutes: 7.5,
  answeredWithinTenMinutesRate: 75,
  resolvedQuestionCount: 6,
  resolutionRate: 60,
  acceptedQuestionCount: 5,
  acceptanceRate: 83.3,
  localContributors: [
    { userId: 'local-1', nickname: '제주바람', answerCount: 9 },
  ],
  userFunnel: {
    signedUpCount: 50,
    verificationAppliedCount: 40,
    verificationAppliedRate: 80,
    verificationApprovedCount: 30,
    verificationApprovedRate: 75,
    travelerApprovedCount: 22,
    localApprovedCount: 10,
    firstTopicCount: 12,
    firstTopicRate: 40,
    answerReceivedCount: 9,
    answerReceivedRate: 75,
    answerAcceptedCount: 6,
    answerAcceptedRate: 66.7,
  },
  supply: {
    unansweredExpiredQuestionCount: 2,
    unansweredExpiredQuestionRate: 20,
    averageAnswersPerAnsweredQuestion: 1.8,
    medianFirstAnswerMinutes: 6.5,
  },
};

const INVALID = '관리자 지표 응답 형식이 올바르지 않습니다.';

describe('admin metrics contract', () => {
  it('parses the complete KPI snapshot', () => {
    expect(parseAdminMetrics(payload)).toEqual(payload);
  });

  it('accepts null supply averages when no topic has answers', () => {
    const parsed = parseAdminMetrics({
      ...payload,
      supply: {
        ...payload.supply,
        averageAnswersPerAnsweredQuestion: null,
        medianFirstAnswerMinutes: null,
      },
    });
    expect(parsed.supply.averageAnswersPerAnsweredQuestion).toBeNull();
    expect(parsed.supply.medianFirstAnswerMinutes).toBeNull();
  });

  it('rejects malformed contributor counts', () => {
    expect(() =>
      parseAdminMetrics({
        ...payload,
        localContributors: [
          { ...payload.localContributors[0], answerCount: -1 },
        ],
      }),
    ).toThrow(INVALID);
  });

  it('rejects a response without the user funnel or supply signals', () => {
    for (const key of ['userFunnel', 'supply']) {
      const partial = Object.fromEntries(
        Object.entries(payload).filter(([name]) => name !== key),
      );
      expect(() => parseAdminMetrics(partial)).toThrow(INVALID);
    }
  });

  it('rejects fractional funnel counts and out-of-range funnel rates', () => {
    expect(() =>
      parseAdminMetrics({
        ...payload,
        userFunnel: { ...payload.userFunnel, firstTopicCount: 1.5 },
      }),
    ).toThrow(INVALID);
    expect(() =>
      parseAdminMetrics({
        ...payload,
        userFunnel: { ...payload.userFunnel, firstTopicRate: 120 },
      }),
    ).toThrow(INVALID);
    expect(() =>
      parseAdminMetrics({
        ...payload,
        supply: { ...payload.supply, medianFirstAnswerMinutes: '6' },
      }),
    ).toThrow(INVALID);
  });
});
