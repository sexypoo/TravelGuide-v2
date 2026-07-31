import type { InfiniteData } from '@tanstack/react-query';
import type {
  Answer,
  Question,
  QuestionDetail,
  QuestionPage,
} from '../api/questions';
import {
  incrementFeedAnswerCount,
  mergeAnswerIntoDetail,
  mergeQuestionIntoFeed,
} from './realtime-cache';

const question: Question = {
  id: 'question-1',
  roomId: 'room-1',
  author: { id: 'traveler-1', nickname: '여행자', badge: 'VERIFIED_TRAVELER' },
  category: 'PLACE',
  urgency: 'NORMAL',
  content: '제주에서 방문할 실내 장소를 자세히 추천해 주세요.',
  contentFormat: 'PLAIN_TEXT',
  areaText: null,
  status: 'OPEN',
  safetyNotice: null,
  answerCount: 0,
  expiresAt: '2026-08-02T00:00:00.000Z',
  resolvedAt: null,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};
const answer: Answer = {
  id: 'answer-1',
  questionId: question.id,
  author: {
    id: 'local-1',
    nickname: '현지인',
    badge: 'VERIFIED_LOCAL',
    verifiedAt: '2026-07-01T00:00:00.000Z',
  },
  content: '현재 직접 확인한 결과 정상 운영 중입니다.',
  contentFormat: 'PLAIN_TEXT',
  sourceType: 'ON_SITE_NOW',
  sourceUrl: null,
  createdAt: '2026-08-01T00:10:00.000Z',
  updatedAt: '2026-08-01T00:10:00.000Z',
};

describe('realtime cache merge', () => {
  it('deduplicates repeated question and answer entities', () => {
    const feed: InfiniteData<QuestionPage> = {
      pages: [{ items: [question], nextCursor: null }],
      pageParams: [null],
    };
    expect(mergeQuestionIntoFeed(feed, question)).toBe(feed);
    const detail: QuestionDetail = { ...question, answers: [] };
    const merged = mergeAnswerIntoDetail(detail, answer);
    expect(merged?.answers).toHaveLength(1);
    expect(mergeAnswerIntoDetail(merged, answer)).toBe(merged);
  });

  it('increments only the matching feed card answer count', () => {
    const feed: InfiniteData<QuestionPage> = {
      pages: [{ items: [question], nextCursor: null }],
      pageParams: [null],
    };
    expect(
      incrementFeedAnswerCount(feed, question.id)?.pages[0]?.items[0]
        ?.answerCount,
    ).toBe(1);
  });
});
