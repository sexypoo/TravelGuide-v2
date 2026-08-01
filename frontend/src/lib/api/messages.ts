import { isParticipantBadge, type PublicParticipant } from './participants';
import { problemFromResponse } from './problem-details';
import {
  questionCategories,
  type QuestionCategory,
  type QuestionStatus,
  type QuestionUrgency,
} from './questions';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.toISOString() === value;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  author: PublicParticipant;
  type: 'TEXT' | 'IMAGE' | 'PLACE' | 'TOPIC_SHARE';
  content: string;
  contentFormat: 'PLAIN_TEXT';
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
  } | null;
  sharedTopic: {
    id: string;
    authorNickname: string;
    category: QuestionCategory;
    urgency: QuestionUrgency;
    content: string;
    areaText: string | null;
    status: QuestionStatus;
    answerCount: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface MessagePage {
  items: ChatMessage[];
  nextCursor: string | null;
}

function parseAuthor(value: unknown): PublicParticipant {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.nickname !== 'string' ||
    !isParticipantBadge(value.badge)
  ) {
    throw new Error('메시지 작성자 응답 형식이 올바르지 않습니다.');
  }
  return { id: value.id, nickname: value.nickname, badge: value.badge };
}

export function parseMessage(value: unknown): ChatMessage {
  const type =
    isRecord(value) && typeof value.type === 'string' ? value.type : 'TEXT';
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.roomId !== 'string' ||
    !['TEXT', 'IMAGE', 'PLACE', 'TOPIC_SHARE'].includes(type) ||
    typeof value.content !== 'string' ||
    value.contentFormat !== 'PLAIN_TEXT' ||
    (value.topicId !== null && typeof value.topicId !== 'string') ||
    !isIsoDate(value.createdAt) ||
    !isIsoDate(value.updatedAt)
  ) {
    throw new Error('메시지 응답 형식이 올바르지 않습니다.');
  }
  const image = value.image;
  if (
    image !== undefined &&
    image !== null &&
    (!isRecord(image) ||
      typeof image.url !== 'string' ||
      typeof image.originalName !== 'string' ||
      typeof image.mimeType !== 'string')
  )
    throw new Error('이미지 메시지 응답 형식이 올바르지 않습니다.');
  const place = value.place;
  if (
    place !== undefined &&
    place !== null &&
    (!isRecord(place) ||
      typeof place.name !== 'string' ||
      (place.address !== null && typeof place.address !== 'string') ||
      typeof place.latitude !== 'number' ||
      typeof place.longitude !== 'number')
  )
    throw new Error('장소 메시지 응답 형식이 올바르지 않습니다.');
  const sharedTopic = value.sharedTopic;
  if (
    sharedTopic !== undefined &&
    sharedTopic !== null &&
    (!isRecord(sharedTopic) ||
      typeof sharedTopic.id !== 'string' ||
      typeof sharedTopic.authorNickname !== 'string' ||
      !questionCategories.includes(sharedTopic.category as QuestionCategory) ||
      !['NORMAL', 'URGENT'].includes(String(sharedTopic.urgency)) ||
      typeof sharedTopic.content !== 'string' ||
      (sharedTopic.areaText !== null &&
        typeof sharedTopic.areaText !== 'string') ||
      !['OPEN', 'RESOLVED', 'REMOVED', 'EXPIRED'].includes(
        String(sharedTopic.status),
      ) ||
      !Number.isInteger(sharedTopic.answerCount))
  )
    throw new Error('공유 토픽 응답 형식이 올바르지 않습니다.');
  return {
    id: value.id,
    roomId: value.roomId,
    author: parseAuthor(value.author),
    type: type as ChatMessage['type'],
    content: value.content,
    contentFormat: value.contentFormat,
    topicId: value.topicId,
    image: (image ?? null) as ChatMessage['image'],
    place: (place ?? null) as ChatMessage['place'],
    sharedTopic: (sharedTopic ?? null) as ChatMessage['sharedTopic'],
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

export function parseMessagePage(value: unknown): MessagePage {
  if (
    !isRecord(value) ||
    !Array.isArray(value.items) ||
    (value.nextCursor !== null && typeof value.nextCursor !== 'string')
  ) {
    throw new Error('메시지 목록 응답 형식이 올바르지 않습니다.');
  }
  return {
    items: value.items.map(parseMessage),
    nextCursor: value.nextCursor,
  };
}

async function apiJson(path: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init?.body === undefined
        ? {}
        : { 'Content-Type': 'application/json' }),
      ...init?.headers,
    },
  });
  if (!response.ok) throw await problemFromResponse(response);
  return response.json() as Promise<unknown>;
}

async function apiForm(path: string, body: FormData): Promise<unknown> {
  const response = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
    body,
  });
  if (!response.ok) throw await problemFromResponse(response);
  return response.json() as Promise<unknown>;
}

export async function getMessagePage(
  roomSlug: string,
  cursor?: string,
): Promise<MessagePage> {
  const query = new URLSearchParams({ limit: '50' });
  if (cursor !== undefined) query.set('cursor', cursor);
  return parseMessagePage(
    await apiJson(
      `/api/v1/rooms/${encodeURIComponent(roomSlug)}/messages?${query.toString()}`,
    ),
  );
}

export async function createMessage(
  roomSlug: string,
  content: string,
): Promise<ChatMessage> {
  return parseMessage(
    await apiJson(`/api/v1/rooms/${encodeURIComponent(roomSlug)}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  );
}

export async function createImageMessage(
  roomSlug: string,
  file: File,
  caption: string,
): Promise<ChatMessage> {
  const body = new FormData();
  body.set('image', file);
  if (caption.trim()) body.set('caption', caption.trim());
  return parseMessage(
    await apiForm(
      `/api/v1/rooms/${encodeURIComponent(roomSlug)}/messages/images`,
      body,
    ),
  );
}

export async function createPlaceMessage(
  roomSlug: string,
  input: {
    placeName: string;
    address?: string;
    latitude: number;
    longitude: number;
    note?: string;
  },
): Promise<ChatMessage> {
  return parseMessage(
    await apiJson(
      `/api/v1/rooms/${encodeURIComponent(roomSlug)}/messages/places`,
      { method: 'POST', body: JSON.stringify(input) },
    ),
  );
}

export async function shareTopicMessage(
  roomSlug: string,
  questionId: string,
): Promise<ChatMessage> {
  return parseMessage(
    await apiJson(
      `/api/v1/rooms/${encodeURIComponent(roomSlug)}/messages/topics`,
      { method: 'POST', body: JSON.stringify({ questionId }) },
    ),
  );
}
