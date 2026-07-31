import { isParticipantBadge, type PublicParticipant } from './participants';
import { problemFromResponse } from './problem-details';

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
  content: string;
  contentFormat: 'PLAIN_TEXT';
  topicId: string | null;
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
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.roomId !== 'string' ||
    typeof value.content !== 'string' ||
    value.contentFormat !== 'PLAIN_TEXT' ||
    (value.topicId !== null && typeof value.topicId !== 'string') ||
    !isIsoDate(value.createdAt) ||
    !isIsoDate(value.updatedAt)
  ) {
    throw new Error('메시지 응답 형식이 올바르지 않습니다.');
  }
  return {
    id: value.id,
    roomId: value.roomId,
    author: parseAuthor(value.author),
    content: value.content,
    contentFormat: value.contentFormat,
    topicId: value.topicId,
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
