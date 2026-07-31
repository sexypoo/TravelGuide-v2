import type {
  QuestionCategory,
  QuestionStatus,
  QuestionUrgency,
} from '@prisma/client';

export type PublicQuestionStatus = QuestionStatus | 'EXPIRED';

export interface QuestionResponse {
  id: string;
  roomId: string;
  author: {
    id: string;
    nickname: string;
    badge: 'VERIFIED_TRAVELER';
  };
  category: QuestionCategory;
  urgency: QuestionUrgency;
  content: string;
  contentFormat: 'PLAIN_TEXT';
  areaText: string | null;
  status: PublicQuestionStatus;
  safetyNotice: string | null;
  answerCount: 0;
  expiresAt: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionListResponse {
  items: QuestionResponse[];
  nextCursor: string | null;
}

export interface QuestionForResponse {
  id: string;
  roomId: string;
  category: QuestionCategory;
  urgency: QuestionUrgency;
  content: string;
  areaText: string | null;
  status: QuestionStatus;
  expiresAt: Date;
  resolvedAt: Date | null;
  removedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; nickname: string };
}

const SAFETY_NOTICE =
  '즉시 위험한 상황이라면 답변을 기다리지 말고 112 또는 119에 먼저 연락하세요.';
const REMOVED_CONTENT = '운영 정책에 따라 숨김 처리된 질문입니다.';

export function deriveQuestionStatus(
  question: Pick<QuestionForResponse, 'status' | 'expiresAt'>,
  now: Date,
): PublicQuestionStatus {
  return question.status === 'OPEN' && question.expiresAt <= now
    ? 'EXPIRED'
    : question.status;
}

export function toQuestionResponse(
  question: QuestionForResponse,
  now = new Date(),
): QuestionResponse {
  const removed = question.status === 'REMOVED' || question.removedAt !== null;
  return {
    id: question.id,
    roomId: question.roomId,
    author: {
      id: question.author.id,
      nickname: question.author.nickname,
      badge: 'VERIFIED_TRAVELER',
    },
    category: question.category,
    urgency: question.urgency,
    content: removed ? REMOVED_CONTENT : question.content,
    contentFormat: 'PLAIN_TEXT',
    areaText: removed ? null : question.areaText,
    status: deriveQuestionStatus(question, now),
    safetyNotice:
      !removed && question.category === 'SAFETY' ? SAFETY_NOTICE : null,
    answerCount: 0,
    expiresAt: question.expiresAt.toISOString(),
    resolvedAt: question.resolvedAt?.toISOString() ?? null,
    createdAt: question.createdAt.toISOString(),
    updatedAt: question.updatedAt.toISOString(),
  };
}
