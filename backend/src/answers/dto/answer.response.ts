import type {
  AnswerSourceType,
  CrowdLevel,
  EntryStatus,
  RoomParticipantKind,
} from '@prisma/client';

export type AnswerParticipantBadge =
  | 'VERIFIED_TRAVELER'
  | 'VERIFIED_LOCAL'
  | 'VERIFIED_BOTH';

export interface AnswerResponse {
  id: string;
  questionId: string;
  author: {
    id: string;
    nickname: string;
    badge: AnswerParticipantBadge;
    verifiedAt: string;
  };
  content: string;
  contentFormat: 'PLAIN_TEXT';
  sourceType: AnswerSourceType;
  sourceUrl: string | null;
  removed: boolean;
  observation: {
    waitMinutes: number | null;
    crowdLevel: CrowdLevel | null;
    entryStatus: EntryStatus | null;
    observedAt: string;
  } | null;
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
  waitMinutes?: number | null;
  crowdLevel?: CrowdLevel | null;
  entryStatus?: EntryStatus | null;
  observedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; nickname: string };
  authorKind?: RoomParticipantKind;
}

function answerBadge(kind: RoomParticipantKind): AnswerParticipantBadge {
  if (kind === 'TRAVELER') return 'VERIFIED_TRAVELER';
  if (kind === 'BOTH') return 'VERIFIED_BOTH';
  return 'VERIFIED_LOCAL';
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
      badge: answerBadge(answer.authorKind ?? 'LOCAL'),
      verifiedAt: verifiedAt.toISOString(),
    },
    content: removed
      ? '운영 정책에 따라 숨김 처리된 답변입니다.'
      : answer.content,
    contentFormat: 'PLAIN_TEXT',
    sourceType: answer.sourceType,
    sourceUrl: removed ? null : answer.sourceUrl,
    removed,
    observation:
      !removed && answer.observedAt != null
        ? {
            waitMinutes: answer.waitMinutes ?? null,
            crowdLevel: answer.crowdLevel ?? null,
            entryStatus: answer.entryStatus ?? null,
            observedAt: answer.observedAt.toISOString(),
          }
        : null,
    createdAt: answer.createdAt.toISOString(),
    updatedAt: answer.updatedAt.toISOString(),
  };
}
