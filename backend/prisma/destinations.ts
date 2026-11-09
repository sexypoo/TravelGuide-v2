// Destinations and their help rooms (#68, ADR-053). Domestic rooms match the
// travel test regions. The seed upserts these on every deploy, so adding a
// city here opens its room. Coordinates are the
// city center; radiusKm bounds local GPS verification.

export interface DestinationSeed {
  slug: string;
  nameKo: string;
  countryCode: string;
  timezone: string;
  centerLatitude: string;
  centerLongitude: string;
  radiusKm: string;
}

export const DESTINATIONS: readonly DestinationSeed[] = [
  {
    slug: 'jeju',
    nameKo: '제주',
    countryCode: 'KR',
    timezone: 'Asia/Seoul',
    centerLatitude: '33.3617',
    centerLongitude: '126.5292',
    radiusKm: '80',
  },
  {
    slug: 'seoul',
    nameKo: '서울',
    countryCode: 'KR',
    timezone: 'Asia/Seoul',
    centerLatitude: '37.5665',
    centerLongitude: '126.9780',
    radiusKm: '25',
  },
  {
    slug: 'busan',
    nameKo: '부산',
    countryCode: 'KR',
    timezone: 'Asia/Seoul',
    centerLatitude: '35.1796',
    centerLongitude: '129.0756',
    radiusKm: '30',
  },
  {
    slug: 'gangneung',
    nameKo: '강릉',
    countryCode: 'KR',
    timezone: 'Asia/Seoul',
    centerLatitude: '37.7519',
    centerLongitude: '128.8761',
    radiusKm: '25',
  },
  // Temporary: the owner's exchange-student city (ADR-053).
  {
    slug: 'marburg',
    nameKo: '마르부르크',
    countryCode: 'DE',
    timezone: 'Europe/Berlin',
    centerLatitude: '50.8021',
    centerLongitude: '8.7667',
    radiusKm: '15',
  },
];

export function roomTitle(nameKo: string): string {
  return `${nameKo} 실시간 여행 도움방`;
}
