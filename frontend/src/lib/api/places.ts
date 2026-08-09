import { problemFromResponse } from './problem-details';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export interface GooglePlace {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  googleMapsUri: string | null;
  category: string | null;
  businessStatus: string | null;
  openNow: boolean | null;
}

function parsePlace(value: unknown): GooglePlace {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.name !== 'string' ||
    (value.address !== null && typeof value.address !== 'string') ||
    typeof value.latitude !== 'number' ||
    typeof value.longitude !== 'number' ||
    (value.googleMapsUri !== null && typeof value.googleMapsUri !== 'string') ||
    (value.category !== null && typeof value.category !== 'string') ||
    (value.businessStatus !== null &&
      typeof value.businessStatus !== 'string') ||
    (value.openNow !== null && typeof value.openNow !== 'boolean')
  ) {
    throw new Error('장소 검색 응답 형식이 올바르지 않습니다.');
  }
  return value as unknown as GooglePlace;
}

async function get(path: string): Promise<GooglePlace[]> {
  const response = await fetch(path, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw await problemFromResponse(response);
  const value: unknown = await response.json();
  if (!isRecord(value) || !Array.isArray(value.items)) {
    throw new Error('장소 검색 목록 형식이 올바르지 않습니다.');
  }
  return value.items.map(parsePlace);
}

export function searchPlaces(
  query: string,
  location?: { latitude: number; longitude: number },
): Promise<GooglePlace[]> {
  const params = new URLSearchParams({ q: query });
  if (location !== undefined) {
    params.set('latitude', String(location.latitude));
    params.set('longitude', String(location.longitude));
  }
  return get(`/api/v1/places/search?${params.toString()}`);
}

export function getNearbyOpenRestaurants(location: {
  latitude: number;
  longitude: number;
}): Promise<GooglePlace[]> {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    radius: '1500',
    openNow: 'true',
  });
  return get(`/api/v1/places/nearby-restaurants?${params.toString()}`);
}
