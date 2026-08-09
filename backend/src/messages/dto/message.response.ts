import type {
  ChatMessageType,
  QuestionCategory,
  QuestionStatus,
  QuestionUrgency,
  RoomParticipantKind,
} from '@prisma/client';
import type { PublicQuestionStatus } from '../../questions/dto/question.response';

export type ParticipantBadge =
  | 'VERIFIED_TRAVELER'
  | 'VERIFIED_LOCAL'
  | 'VERIFIED_BOTH';

export interface SharedTopicResponse {
  id: string;
  authorNickname: string;
  category: QuestionCategory;
  urgency: QuestionUrgency;
  content: string;
  areaText: string | null;
  status: PublicQuestionStatus;
  answerCount: number;
}

export interface MessageResponse {
  id: string;
  roomId: string;
  type: ChatMessageType;
  author: {
    id: string;
    nickname: string;
    badge: ParticipantBadge;
  };
  content: string;
  contentFormat: 'PLAIN_TEXT';
  removed: boolean;
  topicId: string | null;
  image: {
    url: string;
    originalName: string;
    mimeType: string;
  } | null;
  place: {
    name: string;
    address: string | null;
    latitude: number;
    longitude: number;
    googlePlaceId: string | null;
  } | null;
  sharedTopic: SharedTopicResponse | null;
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
  type?: ChatMessageType;
  authorKind: RoomParticipantKind;
  content: string;
  imageObjectKey?: string | null;
  imageOriginalName?: string | null;
  imageMimeType?: string | null;
  placeName?: string | null;
  placeAddress?: string | null;
  placeLatitude?: { toNumber(): number } | null;
  placeLongitude?: { toNumber(): number } | null;
  placeGoogleId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  removedAt?: Date | null;
  author: { id: string; nickname: string };
  topic: { id: string } | null;
  sharedQuestion?: {
    id: string;
    category: QuestionCategory;
    urgency: QuestionUrgency;
    content: string;
    areaText: string | null;
    status: QuestionStatus;
    expiresAt: Date;
    removedAt: Date | null;
    author: { nickname: string };
    _count: { answers: number };
  } | null;
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
  now = new Date(),
): MessageResponse {
  const type = message.type ?? 'TEXT';
  const removed = message.removedAt != null;
  const shared = message.sharedQuestion ?? null;
  const sharedStatus: PublicQuestionStatus | null =
    shared === null
      ? null
      : shared.status === 'OPEN' && shared.expiresAt <= now
        ? 'EXPIRED'
        : shared.status;
  return {
    id: message.id,
    roomId: message.roomId,
    type,
    author: {
      id: message.author.id,
      nickname: message.author.nickname,
      badge: toParticipantBadge(message.authorKind),
    },
    content: removed
      ? '운영 정책에 따라 숨김 처리된 메시지입니다.'
      : message.content,
    contentFormat: 'PLAIN_TEXT',
    removed,
    topicId: message.topic?.id ?? null,
    image:
      !removed &&
      type === 'IMAGE' &&
      message.imageObjectKey != null &&
      message.imageOriginalName != null &&
      message.imageMimeType != null
        ? {
            url: `/api/v1/messages/${encodeURIComponent(message.id)}/image`,
            originalName: message.imageOriginalName,
            mimeType: message.imageMimeType,
          }
        : null,
    place:
      !removed &&
      type === 'PLACE' &&
      message.placeName != null &&
      message.placeLatitude != null &&
      message.placeLongitude != null
        ? {
            name: message.placeName,
            address: message.placeAddress ?? null,
            latitude: message.placeLatitude.toNumber(),
            longitude: message.placeLongitude.toNumber(),
            googlePlaceId: message.placeGoogleId ?? null,
          }
        : null,
    sharedTopic:
      removed ||
      shared === null ||
      sharedStatus === null ||
      shared.removedAt !== null
        ? null
        : {
            id: shared.id,
            authorNickname: shared.author.nickname,
            category: shared.category,
            urgency: shared.urgency,
            content: shared.content,
            areaText: shared.areaText,
            status: sharedStatus,
            answerCount: shared._count.answers,
          },
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
  };
}
