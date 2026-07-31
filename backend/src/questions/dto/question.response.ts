import type {
  QuestionCategory,
  QuestionStatus,
  QuestionUrgency,
  RoomParticipantKind,
} from '@prisma/client';
import type { AnswerResponse } from '../../answers/dto/answer.response';

export type PublicQuestionStatus = QuestionStatus | 'EXPIRED';

export interface QuestionResponse {
  id: string;
  roomId: string;
  author: {
    id: string;
    nickname: string;
    badge: 'VERIFIED_TRAVELER' | 'VERIFIED_LOCAL' | 'VERIFIED_BOTH';
  };
  category: QuestionCategory;
  urgency: QuestionUrgency;
  content: string;
  contentFormat: 'PLAIN_TEXT';
  areaText: string | null;
  sourceMessageId: string | null;
  status: PublicQuestionStatus;
  safetyNotice: string | null;
  answerCount: number;
  acceptedAnswerId: string | null;
  expiresAt: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionDetailResponse extends QuestionResponse {
  answers: AnswerResponse[];
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
  authorKind: RoomParticipantKind;
  sourceMessageId: string | null;
  status: QuestionStatus;
  expiresAt: Date;
  resolvedAt: Date | null;
  acceptedAnswerId: string | null;
  removedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; nickname: string };
  _count: { answers: number };
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
      badge:
        question.authorKind === 'TRAVELER'
          ? 'VERIFIED_TRAVELER'
          : question.authorKind === 'LOCAL'
            ? 'VERIFIED_LOCAL'
            : 'VERIFIED_BOTH',
    },
    category: question.category,
    urgency: question.urgency,
    content: removed ? REMOVED_CONTENT : question.content,
    contentFormat: 'PLAIN_TEXT',
    areaText: removed ? null : question.areaText,
    sourceMessageId: question.sourceMessageId,
    status: deriveQuestionStatus(question, now),
    safetyNotice:
      !removed && question.category === 'SAFETY' ? SAFETY_NOTICE : null,
    answerCount: question._count.answers,
    acceptedAnswerId: question.acceptedAnswerId,
    expiresAt: question.expiresAt.toISOString(),
    resolvedAt: question.resolvedAt?.toISOString() ?? null,
    createdAt: question.createdAt.toISOString(),
    updatedAt: question.updatedAt.toISOString(),
  };
}
