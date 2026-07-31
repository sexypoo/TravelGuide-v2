import type { AuthenticatedUser } from '../auth/authenticated-user';
import type { AnswerResponse } from '../answers/dto/answer.response';
import type { MessageResponse } from '../messages/dto/message.response';
import type { QuestionResponse } from '../questions/dto/question.response';

export interface RealtimeEnvelope<T> {
  eventId: string;
  roomSlug: string;
  occurredAt: string;
  payload: T;
}

export interface ContentRemovedPayload {
  targetType: 'QUESTION' | 'ANSWER';
  targetId: string;
  questionId: string;
}

export interface ClientToServerEvents {
  'room.join': (
    input: unknown,
    acknowledge: (result: RoomMembershipResult) => void,
  ) => void;
  'room.leave': (
    input: unknown,
    acknowledge: (result: RoomMembershipResult) => void,
  ) => void;
}

export interface ServerToClientEvents {
  'room.message.created': (event: RealtimeEnvelope<MessageResponse>) => void;
  'room.question.created': (event: RealtimeEnvelope<QuestionResponse>) => void;
  'room.answer.created': (event: RealtimeEnvelope<AnswerResponse>) => void;
  'room.question.updated': (event: RealtimeEnvelope<QuestionResponse>) => void;
  'room.content.removed': (
    event: RealtimeEnvelope<ContentRemovedPayload>,
  ) => void;
}

export interface SocketData {
  user?: AuthenticatedUser;
}

export type RoomMembershipResult =
  | { ok: true; roomSlug: string }
  | { ok: false; code: string; detail: string };
