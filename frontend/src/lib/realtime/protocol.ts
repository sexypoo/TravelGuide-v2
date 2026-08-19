import { isRecord } from '@/lib/api/runtime';

export interface RealtimeEventEnvelope {
  eventId: string;
  roomSlug: string;
  occurredAt: string;
  payload: unknown;
}

export interface RealtimeServerEvents {
  'room.message.created': (event: unknown) => void;
  'room.question.created': (event: unknown) => void;
  'room.answer.created': (event: unknown) => void;
  'room.question.updated': (event: unknown) => void;
  'room.content.removed': (event: unknown) => void;
}

interface MembershipResult {
  ok: boolean;
  code?: string;
}

export interface RealtimeClientEvents {
  'room.join': (
    input: { roomSlug: string },
    acknowledge?: (result: MembershipResult) => void,
  ) => void;
  'room.leave': (input: { roomSlug: string }) => void;
}

export interface RemovedContentTarget {
  targetType: 'MESSAGE' | 'QUESTION' | 'ANSWER';
  targetId: string;
  questionId: string | null;
}

export function parseRealtimeEnvelope(value: unknown): RealtimeEventEnvelope {
  if (
    !isRecord(value) ||
    typeof value.eventId !== 'string' ||
    typeof value.roomSlug !== 'string' ||
    typeof value.occurredAt !== 'string' ||
    !('payload' in value)
  ) {
    throw new Error('실시간 이벤트 형식이 올바르지 않습니다.');
  }
  return {
    eventId: value.eventId,
    roomSlug: value.roomSlug,
    occurredAt: value.occurredAt,
    payload: value.payload,
  };
}

export function parseRemovedContentTarget(
  value: unknown,
): RemovedContentTarget {
  if (
    !isRecord(value) ||
    !['MESSAGE', 'QUESTION', 'ANSWER'].includes(String(value.targetType)) ||
    typeof value.targetId !== 'string' ||
    (value.questionId !== null && typeof value.questionId !== 'string')
  ) {
    throw new Error('콘텐츠 제거 이벤트 형식이 올바르지 않습니다.');
  }
  return {
    targetType: value.targetType as RemovedContentTarget['targetType'],
    targetId: value.targetId,
    questionId: value.questionId,
  };
}
