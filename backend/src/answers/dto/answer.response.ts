import type { AnswerSourceType } from '@prisma/client';

export interface AnswerResponse {
  id: string;
  questionId: string;
  author: {
    id: string;
    nickname: string;
    badge: 'VERIFIED_LOCAL';
    verifiedAt: string;
  };
  content: string;
  contentFormat: 'PLAIN_TEXT';
  sourceType: AnswerSourceType;
  sourceUrl: string | null;
  removed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnswerForResponse {
  id: string;
  questionId: string;
  content: string;
  sourceType: AnswerSourceType;
  sourceUrl: string | null;
  removedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; nickname: string };
}

export function toAnswerResponse(
  answer: AnswerForResponse,
  verifiedAt: Date,
): AnswerResponse {
  const removed = answer.removedAt !== null;
  return {
    id: answer.id,
    questionId: answer.questionId,
    author: {
      id: answer.author.id,
      nickname: answer.author.nickname,
      badge: 'VERIFIED_LOCAL',
      verifiedAt: verifiedAt.toISOString(),
    },
    content: removed
      ? '운영 정책에 따라 숨김 처리된 답변입니다.'
      : answer.content,
    contentFormat: 'PLAIN_TEXT',
    sourceType: answer.sourceType,
    sourceUrl: removed ? null : answer.sourceUrl,
    removed,
    createdAt: answer.createdAt.toISOString(),
    updatedAt: answer.updatedAt.toISOString(),
  };
}
