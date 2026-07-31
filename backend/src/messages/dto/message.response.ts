import type { RoomParticipantKind } from '@prisma/client';

export type ParticipantBadge =
  | 'VERIFIED_TRAVELER'
  | 'VERIFIED_LOCAL'
  | 'VERIFIED_BOTH';

export interface MessageResponse {
  id: string;
  roomId: string;
  author: {
    id: string;
    nickname: string;
    badge: ParticipantBadge;
  };
  content: string;
  contentFormat: 'PLAIN_TEXT';
  topicId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MessageListResponse {
  items: MessageResponse[];
  nextCursor: string | null;
}

export interface MessageForResponse {
  id: string;
  roomId: string;
  authorKind: RoomParticipantKind;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; nickname: string };
  topic: { id: string } | null;
}

export function toParticipantBadge(
  kind: RoomParticipantKind,
): ParticipantBadge {
  if (kind === 'TRAVELER') return 'VERIFIED_TRAVELER';
  if (kind === 'LOCAL') return 'VERIFIED_LOCAL';
  return 'VERIFIED_BOTH';
}

export function toMessageResponse(
  message: MessageForResponse,
): MessageResponse {
  return {
    id: message.id,
    roomId: message.roomId,
    author: {
      id: message.author.id,
      nickname: message.author.nickname,
      badge: toParticipantBadge(message.authorKind),
    },
    content: message.content,
    contentFormat: 'PLAIN_TEXT',
    topicId: message.topic?.id ?? null,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
  };
}
