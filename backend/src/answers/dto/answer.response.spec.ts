import { toAnswerResponse, type AnswerForResponse } from './answer.response';

describe('answer response', () => {
  it('maps only public local identity and marks content as plain text', () => {
    const answer: AnswerForResponse = {
      id: 'answer-id',
      questionId: 'question-id',
      content: '<script>alert(1)</script> 현장 확인 답변입니다.',
      sourceType: 'ON_SITE_NOW',
      sourceUrl: null,
      removedAt: null,
      createdAt: new Date('2026-07-31T12:00:00.000Z'),
      updatedAt: new Date('2026-07-31T12:00:00.000Z'),
      author: { id: 'local-id', nickname: '제주현지인' },
    };
    const response = toAnswerResponse(
      answer,
      new Date('2026-07-01T00:00:00.000Z'),
    );
    expect(response).toMatchObject({
      content: answer.content,
      contentFormat: 'PLAIN_TEXT',
      author: {
        id: 'local-id',
        nickname: '제주현지인',
        badge: 'VERIFIED_LOCAL',
        verifiedAt: '2026-07-01T00:00:00.000Z',
      },
    });
    expect(JSON.stringify(response)).not.toMatch(/email|role|gps|proof/);
  });

  it('redacts removed content and its source URL', () => {
    const response = toAnswerResponse(
      {
        id: 'removed-answer',
        questionId: 'question-id',
        content: '공개되면 안 되는 원문',
        sourceType: 'OFFICIAL_SOURCE',
        sourceUrl: 'https://example.com/private-source',
        removedAt: new Date('2026-08-01T00:00:00.000Z'),
        createdAt: new Date('2026-07-31T12:00:00.000Z'),
        updatedAt: new Date('2026-08-01T00:00:00.000Z'),
        author: { id: 'local-id', nickname: '제주현지인' },
      },
      new Date('2026-07-01T00:00:00.000Z'),
    );
    expect(response.removed).toBe(true);
    expect(response.content).toBe('운영 정책에 따라 숨김 처리된 답변입니다.');
    expect(response.sourceUrl).toBeNull();
    expect(JSON.stringify(response)).not.toContain('공개되면 안 되는 원문');
  });
});
