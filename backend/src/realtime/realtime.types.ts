import type { AuthenticatedUser } from '../auth/authenticated-user';
import type { AnswerResponse } from '../answers/dto/answer.response';
import type { QuestionResponse } from '../questions/dto/question.response';

export interface RealtimeEnvelope<T> {
  eventId: string;
  roomSlug: string;
  occurredAt: string;
  payload: T;
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
  'room.question.created': (event: RealtimeEnvelope<QuestionResponse>) => void;
  'room.answer.created': (event: RealtimeEnvelope<AnswerResponse>) => void;
}

export interface SocketData {
  user?: AuthenticatedUser;
}

export type RoomMembershipResult =
  | { ok: true; roomSlug: string }
  | { ok: false; code: string; detail: string };
