import 'server-only';

import { fetchProtectedApi } from './protected-server';
import { parseRoom, parseRooms, type Room } from './rooms';

export async function getRooms(): Promise<Room[]> {
  const response = await fetchProtectedApi('/api/v1/rooms', '/app');
  return parseRooms(await response.json());
}

export async function getRoom(slug: string): Promise<Room> {
  const safeSlug = encodeURIComponent(slug);
  const response = await fetchProtectedApi(
    `/api/v1/rooms/${safeSlug}`,
    `/app/rooms/${safeSlug}`,
  );
  return parseRoom(await response.json());
}
