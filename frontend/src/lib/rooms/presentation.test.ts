import type { Room } from '@/lib/api/rooms';
import { parseRoom } from '@/lib/api/rooms';
import { lockedRoomPayload } from '@/test/fixtures';
import { myRooms, roomForCity, splitRooms } from './presentation';

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
  room('seoul', '서울', 'KR'),
  room('marburg', '마르부르크', 'DE'),
  room('gangneung', '강릉', 'KR', 'AVAILABLE'),
  room('jeju', '제주', 'KR'),
  room('busan', '부산', 'KR', 'TRAVELER_PENDING'),
];

describe('room presentation', () => {
  it('orders domestic rooms like the travel test regions', () => {
    const { domestic } = splitRooms(rooms);
    expect(domestic.map((item) => item.destination.nameKo)).toEqual([
      '제주',
      '부산',
      '강릉',
      '서울',
    ]);
  });

  it('puts rooms abroad in the temporary section', () => {
    expect(splitRooms(rooms).temporary.map((item) => item.slug)).toEqual([
      'marburg',
    ]);
  });

  it('keeps only rooms the user can enter or is waiting on', () => {
    expect(myRooms(rooms).map((item) => item.slug)).toEqual([
      'gangneung',
      'busan',
    ]);
  });

  it('finds a room by city slug from the URL', () => {
    expect(roomForCity(rooms, 'marburg')?.slug).toBe('marburg');
    expect(roomForCity(rooms, 'paris')).toBeUndefined();
    expect(roomForCity(rooms, ['busan'])).toBeUndefined();
    expect(roomForCity(rooms, undefined)).toBeUndefined();
  });
});
