import type { Room } from '@/lib/api/rooms';

// Grouping and labels for the city room list (#68).

const countryNames: Readonly<Record<string, string>> = {
  KR: '한국',
  DE: '독일',
  GB: '영국',
  IS: '아이슬란드',
  CZ: '체코',
  AT: '오스트리아',
  HU: '헝가리',
  IT: '이탈리아',
  CH: '스위스',
  FR: '프랑스',
  ES: '스페인',
  NL: '네덜란드',
};

export function countryName(countryCode: string): string {
  return countryNames[countryCode] ?? countryCode;
}

export interface CountryRooms {
  countryCode: string;
  name: string;
  rooms: Room[];
}

/** Rooms grouped by country: Korea first, then countries by Korean name. */
export function groupRoomsByCountry(rooms: readonly Room[]): CountryRooms[] {
  const groups = new Map<string, Room[]>();
  for (const room of rooms) {
    const code = room.destination.countryCode;
    groups.set(code, [...(groups.get(code) ?? []), room]);
  }
  return [...groups.entries()]
    .map(([countryCode, items]) => ({
      countryCode,
      name: countryName(countryCode),
      rooms: [...items].sort((a, b) =>
        a.destination.nameKo.localeCompare(b.destination.nameKo, 'ko'),
      ),
    }))
    .sort((a, b) => {
      if (a.countryCode === 'KR') return -1;
      if (b.countryCode === 'KR') return 1;
      return a.name.localeCompare(b.name, 'ko');
    });
}

/** Rooms the user can enter or is waiting on, for the home screen. */
export function myRooms(rooms: readonly Room[]): Room[] {
  return rooms.filter((room) => room.access.status !== 'VERIFICATION_REQUIRED');
}

/** Finds the room for a destination slug given in a URL, if any. */
export function roomForCity(
  rooms: readonly Room[],
  city: string | string[] | undefined,
): Room | undefined {
  if (typeof city !== 'string') return undefined;
  return rooms.find((room) => room.destination.slug === city);
}
