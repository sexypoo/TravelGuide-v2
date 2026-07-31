import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Server } from 'socket.io';
import type { AnswerResponse } from '../answers/dto/answer.response';
import type { MessageResponse } from '../messages/dto/message.response';
import type { QuestionResponse } from '../questions/dto/question.response';
import type {
  ClientToServerEvents,
  ContentRemovedPayload,
  RealtimeEnvelope,
  ServerToClientEvents,
  SocketData,
} from './realtime.types';

export type RealtimeServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

export function realtimeRoomKey(roomId: string): string {
  return `destination-room:${roomId}`;
}

@Injectable()
export class RealtimePublisher {
  private server: RealtimeServer | null = null;

  attachServer(server: RealtimeServer): void {
    this.server = server;
  }

  publishQuestionCreated(
    roomId: string,
    roomSlug: string,
    payload: QuestionResponse,
    now = new Date(),
  ): void {
    this.server
      ?.to(realtimeRoomKey(roomId))
      .emit('room.question.created', this.envelope(roomSlug, payload, now));
  }

  publishMessageCreated(
    roomId: string,
    roomSlug: string,
    payload: MessageResponse,
    now = new Date(),
  ): void {
    this.server
      ?.to(realtimeRoomKey(roomId))
      .emit('room.message.created', this.envelope(roomSlug, payload, now));
  }

  publishAnswerCreated(
    roomId: string,
    roomSlug: string,
    payload: AnswerResponse,
    now = new Date(),
  ): void {
    this.server
      ?.to(realtimeRoomKey(roomId))
      .emit('room.answer.created', this.envelope(roomSlug, payload, now));
  }

  publishQuestionUpdated(
    roomId: string,
    roomSlug: string,
    payload: QuestionResponse,
    now = new Date(),
  ): void {
    this.server
      ?.to(realtimeRoomKey(roomId))
      .emit('room.question.updated', this.envelope(roomSlug, payload, now));
  }

  publishContentRemoved(
    roomId: string,
    roomSlug: string,
    payload: ContentRemovedPayload,
    now = new Date(),
  ): void {
    this.server
      ?.to(realtimeRoomKey(roomId))
      .emit('room.content.removed', this.envelope(roomSlug, payload, now));
  }

  private envelope<T>(
    roomSlug: string,
    payload: T,
    now: Date,
  ): RealtimeEnvelope<T> {
    return {
      eventId: `evt_${randomUUID()}`,
      roomSlug,
      occurredAt: now.toISOString(),
      payload,
    };
  }
}
