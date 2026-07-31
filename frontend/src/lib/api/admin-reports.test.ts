import { parseAdminReport } from './admin-reports';

const payload = {
  id: 'report-1',
  reporter: { id: 'reporter-1', nickname: '신고자' },
  targetType: 'ANSWER',
  targetId: 'answer-1',
  target: {
    author: { id: 'local-1', nickname: '현지인' },
    content: '신고된 원문',
    removed: false,
    roomSlug: 'jeju',
    questionId: 'question-1',
  },
  reason: 'FALSE_INFORMATION',
  detail: '현장과 다른 정보입니다.',
  status: 'PENDING',
  reviewedBy: null,
  reviewedAt: null,
  resolutionNote: null,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

describe('admin report parser', () => {
  it('parses explicit moderation evidence', () => {
    expect(parseAdminReport(payload)).toMatchObject({
      id: 'report-1',
      target: { content: '신고된 원문' },
    });
  });

  it('rejects malformed status and target shapes', () => {
    expect(() => parseAdminReport({ ...payload, status: 'HIDDEN' })).toThrow();
    expect(() => parseAdminReport({ ...payload, target: null })).toThrow();
  });
});
