import { parseMessage, parseMessagePage } from './messages';

const message = {
  id: 'message-1',
  roomId: 'room-1',
  author: {
    id: 'local-1',
    nickname: '제주현지인',
    badge: 'VERIFIED_LOCAL',
    email: 'private@example.com',
  },
  content: '<script>버스가 지연되고 있어요.</script>',
  contentFormat: 'PLAIN_TEXT',
  topicId: null,
  createdAt: '2026-08-01T12:00:00.000Z',
  updatedAt: '2026-08-01T12:00:00.000Z',
  proofObjectKey: 'private-proof',
};

describe('message API contracts', () => {
  it('keeps plain text and drops private extras', () => {
    const parsed = parseMessage(message);
    expect(parsed.content).toContain('<script>');
    expect(parsed.author.badge).toBe('VERIFIED_LOCAL');
    expect(JSON.stringify(parsed)).not.toMatch(
      /private@example|proofObjectKey/,
    );
  });

  it('parses a cursor page and rejects invalid participant badges', () => {
    expect(
      parseMessagePage({ items: [message], nextCursor: 'older-page' }),
    ).toMatchObject({ nextCursor: 'older-page' });
    expect(() =>
      parseMessage({
        ...message,
        author: { ...message.author, badge: 'UNVERIFIED' },
      }),
    ).toThrow('메시지 작성자 응답 형식');
  });

  it('parses a topic card and place without accepting malformed coordinates', () => {
    expect(
      parseMessage({
        ...message,
        type: 'TOPIC_SHARE',
        sharedTopic: {
          id: 'question-1',
          authorNickname: '여행자',
          category: 'WAITING',
          urgency: 'URGENT',
          content: '지금 입장 대기가 얼마나 되나요?',
          areaText: '성산일출봉',
          status: 'OPEN',
          answerCount: 3,
        },
      }).sharedTopic?.category,
    ).toBe('WAITING');
    expect(() =>
      parseMessage({
        ...message,
        type: 'PLACE',
        place: {
          name: '성산일출봉',
          address: null,
          latitude: '33.4',
          longitude: 126.9,
        },
      }),
    ).toThrow('장소 메시지 응답 형식');

    expect(
      parseMessage({
        ...message,
        type: 'PLACE',
        place: {
          name: '성산일출봉',
          address: '제주특별자치도 서귀포시 성산읍',
          latitude: 33.458,
          longitude: 126.942,
          googlePlaceId: 'ChIJ-google-place',
        },
      }).place?.googlePlaceId,
    ).toBe('ChIJ-google-place');
  });
});
