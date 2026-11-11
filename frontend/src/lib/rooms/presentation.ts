import type { Locale } from '@/i18n/config';
import type { Room } from '@/lib/api/rooms';
import { COURSE_REGIONS } from '@/lib/travel-test/courses';

// How the room list is ordered and split (#68, ADR-053). Domestic rooms follow
// the travel test's region order so a test result leads to the same city.

const regionOrder: readonly string[] = COURSE_REGIONS.map(
  (region) => region.key,
);

function domesticRank(room: Room): number {
  const index = regionOrder.indexOf(room.destination.slug);
  return index === -1 ? regionOrder.length : index;
}

export interface RoomSections {
  domestic: Room[];
  temporary: Room[];
}

/** Domestic rooms in test-region order; rooms abroad are temporary. */
export function splitRooms(rooms: readonly Room[]): RoomSections {
  const byName = (a: Room, b: Room): number =>
    a.destination.nameKo.localeCompare(b.destination.nameKo, 'ko');
  return {
    domestic: rooms
      .filter((room) => room.destination.countryCode === 'KR')
      .sort((a, b) => domesticRank(a) - domesticRank(b) || byName(a, b)),
    temporary: rooms
      .filter((room) => room.destination.countryCode !== 'KR')
      .sort(byName),
  };
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

// City names are data from the API in Korean. English gets a fixed name for
// the cities we run rooms in, and falls back to the Korean name (#80).
const englishCityNames: Readonly<Record<string, string>> = {
  jeju: 'Jeju',
  busan: 'Busan',
  gangneung: 'Gangneung',
  seoul: 'Seoul',
  marburg: 'Marburg',
};

/** The destination's display name in the given locale. */
export function destinationName(
  destination: { slug?: string; nameKo: string },
  locale: Locale = 'ko',
): string {
  if (locale === 'en' && destination.slug !== undefined) {
    return englishCityNames[destination.slug] ?? destination.nameKo;
  }
  return destination.nameKo;
}
