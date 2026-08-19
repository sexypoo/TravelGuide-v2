import { parseRealtimeEnvelope, parseRemovedContentTarget } from './protocol';

describe('realtime protocol parsing', () => {
  it('parses a complete event envelope without changing its payload', () => {
    const payload = { id: 'message-1' };

    expect(
      parseRealtimeEnvelope({
        eventId: 'event-1',
        roomSlug: 'jeju',
        occurredAt: '2026-08-19T06:00:00.000Z',
        payload,
      }),
    ).toEqual({
      eventId: 'event-1',
      roomSlug: 'jeju',
      occurredAt: '2026-08-19T06:00:00.000Z',
      payload,
    });
  });

  it.each([
    null,
    {},
    { eventId: 'event-1', roomSlug: 'jeju', occurredAt: 'now' },
  ])('rejects malformed event envelopes', (value: unknown) => {
    expect(() => parseRealtimeEnvelope(value)).toThrow(
      '실시간 이벤트 형식이 올바르지 않습니다.',
    );
  });

  it('parses removed content targets', () => {
    expect(
      parseRemovedContentTarget({
        targetType: 'ANSWER',
        targetId: 'answer-1',
        questionId: 'question-1',
      }),
    ).toEqual({
      targetType: 'ANSWER',
      targetId: 'answer-1',
      questionId: 'question-1',
    });
  });

  it('rejects unknown removal target types', () => {
    expect(() =>
      parseRemovedContentTarget({
        targetType: 'POST',
        targetId: 'post-1',
        questionId: null,
      }),
    ).toThrow('콘텐츠 제거 이벤트 형식이 올바르지 않습니다.');
  });
});
