import { requestJson } from './client';
import { isIsoDate, isRecord } from './runtime';

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

export async function getPlaceFavorites(): Promise<PlaceFavorite[]> {
  const value = await requestJson('/api/v1/place-favorites');
  if (!isRecord(value) || !Array.isArray(value.items)) {
    throw new Error('찜한 장소 목록 형식이 올바르지 않습니다.');
  }
  return value.items.map(parseFavorite);
}

export async function savePlaceFavorite(
  messageId: string,
): Promise<PlaceFavorite> {
  return parseFavorite(
    await requestJson('/api/v1/place-favorites', {
      method: 'POST',
      body: JSON.stringify({ messageId }),
    }),
  );
}

export async function removePlaceFavorite(favoriteId: string): Promise<void> {
  await requestJson(
    `/api/v1/place-favorites/${encodeURIComponent(favoriteId)}/remove`,
    { method: 'POST' },
  );
}
