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
};

describe('admin metrics contract', () => {
  it('parses the complete KPI snapshot', () => {
    expect(parseAdminMetrics(payload)).toEqual(payload);
  });

  it('rejects malformed contributor counts', () => {
    expect(() =>
      parseAdminMetrics({
        ...payload,
        localContributors: [
          { ...payload.localContributors[0], answerCount: -1 },
        ],
      }),
    ).toThrow('관리자 지표 응답 형식이 올바르지 않습니다.');
  });
});
