import type { AnswerResponse } from '../answers/dto/answer.response';
import { buildLiveSummary } from './questions.service';

function answer(
  id: string,
  authorId: string,
  waitMinutes: number,
  observedAt: string,
): AnswerResponse {
  return {
    id,
    questionId: 'question-id',
    author: {
      id: authorId,
      nickname: authorId,
      badge: 'VERIFIED_TRAVELER',
      verifiedAt: '2026-08-01T00:00:00.000Z',
    },
    content: '현장에서 직접 확인한 대기 현황입니다.',
    contentFormat: 'PLAIN_TEXT',
    sourceType: 'ON_SITE_NOW',
    sourceUrl: null,
    removed: false,
    image: null,
    observation: {
      waitMinutes,
      crowdLevel: 'BUSY',
      entryStatus: 'OPEN',
      observedAt,
    },
    createdAt: observedAt,
    updatedAt: observedAt,
  };
}

describe('live status summary', () => {
  it('uses only the newest observation from each author', () => {
    const summary = buildLiveSummary(
      'WAITING',
      [
        answer('old-a', 'author-a', 90, '2026-08-01T00:10:00.000Z'),
        answer('new-a', 'author-a', 30, '2026-08-01T00:25:00.000Z'),
        answer('author-b', 'author-b', 35, '2026-08-01T00:20:00.000Z'),
      ],
      new Date('2026-08-01T00:30:00.000Z'),
    );
    expect(summary).toMatchObject({
      freshness: 'LIVE',
      responseCount: 2,
      agreementCount: 2,
      waitMinutes: { min: 30, max: 40 },
    });
  });

  it('marks the last known status stale after thirty minutes', () => {
    const summary = buildLiveSummary(
      'CROWD',
      [answer('answer-a', 'author-a', 20, '2026-08-01T00:00:00.000Z')],
      new Date('2026-08-01T00:31:00.000Z'),
    );
    expect(summary?.freshness).toBe('STALE');
    expect(summary?.staleAfter).toBe('2026-08-01T00:30:00.000Z');
  });
});
