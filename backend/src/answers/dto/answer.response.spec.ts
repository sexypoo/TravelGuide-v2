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
});
