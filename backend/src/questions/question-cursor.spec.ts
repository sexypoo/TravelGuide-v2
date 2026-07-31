import { decodeQuestionCursor, encodeQuestionCursor } from './question-cursor';

describe('question cursor', () => {
  it('round-trips a createdAt and id boundary', () => {
    const cursor = {
      createdAt: new Date('2026-07-31T12:00:00.000Z'),
      id: 'question-id',
    };
    expect(decodeQuestionCursor(encodeQuestionCursor(cursor))).toEqual(cursor);
  });

  it.each(['not-base64', Buffer.from('{}').toString('base64url')])(
    'rejects an invalid cursor',
    (value) => {
      expect(decodeQuestionCursor(value)).toBeNull();
    },
  );
});
