import { toMessageResponse, type MessageForResponse } from './message.response';

type SharedQuestion = NonNullable<MessageForResponse['sharedQuestion']>;

const topicText = '숨겨야 하는 토픽 본문입니다. 위치를 알려 주세요.';
const now = new Date('2026-08-01T02:00:00.000Z');

function sharedQuestion(
  overrides: Partial<SharedQuestion> = {},
): SharedQuestion {
  return {
    id: 'question-id',
    category: 'TRANSPORT',
    urgency: 'URGENT',
    content: topicText,
    areaText: '성수역',
    status: 'OPEN',
    expiresAt: new Date('2026-08-01T05:00:00.000Z'),
    removedAt: null,
    author: { nickname: '질문자' },
    _count: { answers: 2 },
    ...overrides,
  };
}

function topicShareMessage(shared: SharedQuestion | null): MessageForResponse {
  return {
    id: 'message-id',
    roomId: 'room-id',
    type: 'TOPIC_SHARE',
    authorKind: 'TRAVELER',
    content: topicText,
    createdAt: new Date('2026-08-01T01:00:00.000Z'),
    updatedAt: new Date('2026-08-01T01:00:00.000Z'),
    author: { id: 'author-id', nickname: '참여자' },
    topic: null,
    sharedQuestion: shared,
  };
}

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

  it('keeps a shared topic card for a visible topic', () => {
    const response = toMessageResponse(
      topicShareMessage(sharedQuestion()),
      now,
    );

    expect(response.content).toBe(topicText);
    expect(response.sharedTopic).toMatchObject({
      id: 'question-id',
      content: topicText,
      status: 'OPEN',
      answerCount: 2,
    });
  });

  // Regression for #88: hidden topics leaked through chat shares.
  it.each([
    ['has removedAt', sharedQuestion({ removedAt: now })],
    ['has REMOVED status', sharedQuestion({ status: 'REMOVED' })],
    ['is missing', null],
  ])('hides the topic text when the shared topic %s', (_case, shared) => {
    const response = toMessageResponse(topicShareMessage(shared), now);

    expect(response.sharedTopic).toBeNull();
    expect(response.content).toBe('');
    expect(JSON.stringify(response)).not.toContain(topicText);
  });

  it('keeps text content when a non-share message has no shared topic', () => {
    const response = toMessageResponse(
      { ...topicShareMessage(null), type: 'TEXT' },
      now,
    );

    expect(response.content).toBe(topicText);
  });
});
