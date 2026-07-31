import type { QuestionForResponse } from './question.response';
import { deriveQuestionStatus, toQuestionResponse } from './question.response';

function question(
  overrides: Partial<QuestionForResponse> = {},
): QuestionForResponse {
  return {
    id: 'question-id',
    roomId: 'room-id',
    category: 'PLACE',
    urgency: 'NORMAL',
    content: '<script>alert(1)</script> 제주 질문 본문입니다.',
    areaText: '서귀포',
    status: 'OPEN',
    expiresAt: new Date('2026-08-01T12:00:00.000Z'),
    resolvedAt: null,
    removedAt: null,
    createdAt: new Date('2026-07-31T12:00:00.000Z'),
    updatedAt: new Date('2026-07-31T12:00:00.000Z'),
    author: { id: 'user-id', nickname: '여행자' },
    _count: { answers: 0 },
    ...overrides,
  };
}

describe('question response', () => {
  it('derives expiry at the exact boundary', () => {
    const item = question();
    expect(deriveQuestionStatus(item, item.expiresAt)).toBe('EXPIRED');
    expect(
      deriveQuestionStatus(item, new Date(item.expiresAt.getTime() - 1)),
    ).toBe('OPEN');
  });

  it('keeps content explicitly plain text and adds the safety notice', () => {
    const response = toQuestionResponse(
      question({ category: 'SAFETY' }),
      new Date('2026-07-31T13:00:00.000Z'),
    );
    expect(response.content).toContain('<script>');
    expect(response.contentFormat).toBe('PLAIN_TEXT');
    expect(response.safetyNotice).toContain('112');
    expect(response.author.badge).toBe('VERIFIED_TRAVELER');
  });

  it('hides removed content and area text', () => {
    const response = toQuestionResponse(
      question({ status: 'REMOVED', removedAt: new Date() }),
    );
    expect(response.content).toBe('운영 정책에 따라 숨김 처리된 질문입니다.');
    expect(response.areaText).toBeNull();
  });
});
