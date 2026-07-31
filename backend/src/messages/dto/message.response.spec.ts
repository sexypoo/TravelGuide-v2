import { toMessageResponse } from './message.response';

describe('message response', () => {
  it.each([
    ['TRAVELER', 'VERIFIED_TRAVELER'],
    ['LOCAL', 'VERIFIED_LOCAL'],
    ['BOTH', 'VERIFIED_BOTH'],
  ] as const)('maps %s to its public badge', (authorKind, badge) => {
    const response = toMessageResponse({
      id: 'message-id',
      roomId: 'room-id',
      authorKind,
      content: '<script>plain text</script>',
      createdAt: new Date('2026-08-01T01:00:00.000Z'),
      updatedAt: new Date('2026-08-01T01:00:00.000Z'),
      author: { id: 'author-id', nickname: '참여자' },
      topic: null,
    });

    expect(response).toMatchObject({
      content: '<script>plain text</script>',
      contentFormat: 'PLAIN_TEXT',
      topicId: null,
      author: { badge },
    });
  });
});
