import type { Room } from '@/lib/api/rooms';
import { parseRoom } from '@/lib/api/rooms';
import { lockedRoomPayload } from '@/test/fixtures';
import {
  countryName,
  groupRoomsByCountry,
  myRooms,
  roomForCity,
} from './presentation';

function room(
  slug: string,
  nameKo: string,
  countryCode: string,
  status: Room['access']['status'] = 'VERIFICATION_REQUIRED',
): Room {
  const base = parseRoom(lockedRoomPayload);
  return {
    ...base,
    id: `room-${slug}`,
    slug,
    destination: { ...base.destination, id: slug, slug, nameKo, countryCode },
    access: { ...base.access, status },
  };
}

const rooms = [
  room('vienna', '빈', 'AT'),
  room('rome', '로마', 'IT', 'AVAILABLE'),
  room('jeju', '제주', 'KR'),
  room('venice', '베네치아', 'IT', 'TRAVELER_PENDING'),
  room('marburg', '마르부르크', 'DE'),
];

describe('room presentation', () => {
  it('groups rooms by country with Korea first and names sorted', () => {
    const groups = groupRoomsByCountry(rooms);
    expect(groups.map((group) => group.name)).toEqual([
      '한국',
      '독일',
      '오스트리아',
      '이탈리아',
    ]);
    expect(groups[3]?.rooms.map((item) => item.destination.nameKo)).toEqual([
      '로마',
      '베네치아',
    ]);
  });

  it('falls back to the code for unknown countries', () => {
    expect(countryName('PT')).toBe('PT');
  });

  it('keeps only rooms the user can enter or is waiting on', () => {
    expect(myRooms(rooms).map((item) => item.slug)).toEqual(['rome', 'venice']);
  });

  it('finds a room by city slug from the URL', () => {
    expect(roomForCity(rooms, 'marburg')?.slug).toBe('marburg');
    expect(roomForCity(rooms, 'paris')).toBeUndefined();
    expect(roomForCity(rooms, ['rome'])).toBeUndefined();
    expect(roomForCity(rooms, undefined)).toBeUndefined();
  });
});
