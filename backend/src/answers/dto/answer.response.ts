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
  return {
    id: answer.id,
    questionId: answer.questionId,
    author: {
      id: answer.author.id,
      nickname: answer.author.nickname,
      badge: 'VERIFIED_LOCAL',
      verifiedAt: verifiedAt.toISOString(),
    },
    content: answer.content,
    contentFormat: 'PLAIN_TEXT',
    sourceType: answer.sourceType,
    sourceUrl: answer.sourceUrl,
    createdAt: answer.createdAt.toISOString(),
    updatedAt: answer.updatedAt.toISOString(),
  };
}
