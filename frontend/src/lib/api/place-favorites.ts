import { problemFromResponse } from './problem-details';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === value;
}

export interface PlaceFavorite {
  id: string;
  sourceMessageId: string | null;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  createdAt: string;
}

function parseFavorite(value: unknown): PlaceFavorite {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    (value.sourceMessageId !== null &&
      typeof value.sourceMessageId !== 'string') ||
    typeof value.name !== 'string' ||
    (value.address !== null && typeof value.address !== 'string') ||
    typeof value.latitude !== 'number' ||
    typeof value.longitude !== 'number' ||
    !isIsoDate(value.createdAt)
  ) {
    throw new Error('찜한 장소 응답 형식이 올바르지 않습니다.');
  }
  return {
    id: value.id,
    sourceMessageId: value.sourceMessageId,
    name: value.name,
    address: value.address,
    latitude: value.latitude,
    longitude: value.longitude,
    createdAt: value.createdAt,
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

export async function getPlaceFavorites(): Promise<PlaceFavorite[]> {
  const value = await apiJson('/api/v1/place-favorites');
  if (!isRecord(value) || !Array.isArray(value.items)) {
    throw new Error('찜한 장소 목록 형식이 올바르지 않습니다.');
  }
  return value.items.map(parseFavorite);
}

export async function savePlaceFavorite(
  messageId: string,
): Promise<PlaceFavorite> {
  return parseFavorite(
    await apiJson('/api/v1/place-favorites', {
      method: 'POST',
      body: JSON.stringify({ messageId }),
    }),
  );
}

export async function removePlaceFavorite(favoriteId: string): Promise<void> {
  await apiJson(
    `/api/v1/place-favorites/${encodeURIComponent(favoriteId)}/remove`,
    { method: 'POST' },
  );
}
