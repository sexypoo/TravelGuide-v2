import { decodeMessageCursor, encodeMessageCursor } from './message-cursor';

describe('message cursor', () => {
  it('round-trips a createdAt and id boundary', () => {
    const cursor = {
      createdAt: new Date('2026-08-01T01:00:00.000Z'),
      id: 'message-id',
    };
    expect(decodeMessageCursor(encodeMessageCursor(cursor))).toEqual(cursor);
  });

  it.each(['not-base64', Buffer.from('{}').toString('base64url')])(
    'rejects an invalid cursor',
    (value) => {
      expect(decodeMessageCursor(value)).toBeNull();
    },
  );
});
