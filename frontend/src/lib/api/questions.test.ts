import { parseQuestionDetail, parseQuestionPage } from './questions';

const question = {
  id: 'question-1',
  roomId: 'room-1',
  author: {
    id: 'traveler-1',
    nickname: '제주여행자',
    badge: 'VERIFIED_TRAVELER',
    email: 'private@example.com',
  },
  category: 'PLACE',
  urgency: 'URGENT',
  content: '<script>alert(1)</script> 제주 실내 장소를 알려주세요.',
  contentFormat: 'PLAIN_TEXT',
  areaText: '제주시',
  image: {
    url: '/api/v1/questions/question-1/image',
    originalName: '현장.png',
    mimeType: 'image/png',
  },
  sourceMessageId: null,
  status: 'OPEN',
  safetyNotice: null,
  answerCount: 1,
  acceptedAnswerId: null,
  expiresAt: '2026-08-02T12:00:00.000Z',
  resolvedAt: null,
  createdAt: '2026-08-01T12:00:00.000Z',
  updatedAt: '2026-08-01T12:00:00.000Z',
  proofObjectKey: 'must-not-survive',
};

const answer = {
  id: 'answer-1',
  questionId: 'question-1',
  author: {
    id: 'local-1',
    nickname: '제주현지인',
    badge: 'VERIFIED_LOCAL',
    verifiedAt: '2026-07-01T00:00:00.000Z',
    gpsLat: 33.3,
  },
  content: '현재 직접 확인했으며 정상 운영하고 있습니다.',
  contentFormat: 'PLAIN_TEXT',
  sourceType: 'OFFICIAL_SOURCE',
  sourceUrl: 'https://example.com/notice',
  removed: false,
  createdAt: '2026-08-01T12:10:00.000Z',
  updatedAt: '2026-08-01T12:10:00.000Z',
};

describe('question API contracts', () => {
  it('parses explicit public fields and drops private extras', () => {
    const detail = parseQuestionDetail({ ...question, answers: [answer] });
    expect(detail.content).toContain('<script>');
    expect(detail.answers[0]?.sourceUrl).toBe('https://example.com/notice');
    expect(detail.image?.originalName).toBe('현장.png');
    expect(JSON.stringify(detail)).not.toMatch(
      /private@example|proofObjectKey|gpsLat/,
    );
  });

  it('parses cursor pages and rejects a non-HTTPS answer URL', () => {
    expect(
      parseQuestionPage({ items: [question], nextCursor: 'opaque-cursor' }),
    ).toMatchObject({ nextCursor: 'opaque-cursor' });
    expect(() =>
      parseQuestionDetail({
        ...question,
        answers: [{ ...answer, sourceUrl: 'http://example.com' }],
      }),
    ).toThrow('답변 출처 URL 형식');
  });

  it('parses structured field observations and their live summary', () => {
    const detail = parseQuestionDetail({
      ...question,
      category: 'WAITING',
      answers: [
        {
          ...answer,
          observation: {
            waitMinutes: 35,
            crowdLevel: 'BUSY',
            entryStatus: 'OPEN',
            observedAt: '2026-08-01T12:08:00.000Z',
          },
        },
      ],
      liveSummary: {
        freshness: 'LIVE',
        responseCount: 3,
        agreementCount: 2,
        waitMinutes: { min: 30, max: 40 },
        crowdLevel: 'BUSY',
        entryStatus: 'OPEN',
        lastObservedAt: '2026-08-01T12:08:00.000Z',
        recommendedRecheckAt: '2026-08-01T12:18:00.000Z',
        staleAfter: '2026-08-01T12:38:00.000Z',
        description: '현장 답변 기준 약 30~40분입니다.',
      },
    });
    expect(detail.liveSummary?.waitMinutes).toEqual({ min: 30, max: 40 });
    expect(detail.answers[0]?.observation?.crowdLevel).toBe('BUSY');
  });
});
