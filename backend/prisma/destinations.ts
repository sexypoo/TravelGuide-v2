// Destinations and their help rooms (#68, ADR-053). The seed upserts these
// on every deploy, so adding a city here opens its room. Coordinates are the
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
    slug: 'marburg',
    nameKo: '마르부르크',
    countryCode: 'DE',
    timezone: 'Europe/Berlin',
    centerLatitude: '50.8021',
    centerLongitude: '8.7667',
    radiusKm: '15',
  },
  {
    slug: 'london',
    nameKo: '런던',
    countryCode: 'GB',
    timezone: 'Europe/London',
    centerLatitude: '51.5072',
    centerLongitude: '-0.1276',
    radiusKm: '35',
  },
  {
    slug: 'iceland',
    nameKo: '아이슬란드',
    countryCode: 'IS',
    timezone: 'Atlantic/Reykjavik',
    centerLatitude: '64.9631',
    centerLongitude: '-19.0208',
    radiusKm: '300',
  },
  {
    slug: 'prague',
    nameKo: '프라하',
    countryCode: 'CZ',
    timezone: 'Europe/Prague',
    centerLatitude: '50.0755',
    centerLongitude: '14.4378',
    radiusKm: '25',
  },
  {
    slug: 'vienna',
    nameKo: '빈',
    countryCode: 'AT',
    timezone: 'Europe/Vienna',
    centerLatitude: '48.2082',
    centerLongitude: '16.3738',
    radiusKm: '25',
  },
  {
    slug: 'budapest',
    nameKo: '부다페스트',
    countryCode: 'HU',
    timezone: 'Europe/Budapest',
    centerLatitude: '47.4979',
    centerLongitude: '19.0402',
    radiusKm: '25',
  },
  {
    slug: 'rome',
    nameKo: '로마',
    countryCode: 'IT',
    timezone: 'Europe/Rome',
    centerLatitude: '41.9028',
    centerLongitude: '12.4964',
    radiusKm: '30',
  },
  {
    slug: 'florence',
    nameKo: '피렌체',
    countryCode: 'IT',
    timezone: 'Europe/Rome',
    centerLatitude: '43.7696',
    centerLongitude: '11.2558',
    radiusKm: '20',
  },
  {
    slug: 'venice',
    nameKo: '베네치아',
    countryCode: 'IT',
    timezone: 'Europe/Rome',
    centerLatitude: '45.4408',
    centerLongitude: '12.3155',
    radiusKm: '20',
  },
  {
    slug: 'interlaken',
    nameKo: '인터라켄·융프라우',
    countryCode: 'CH',
    timezone: 'Europe/Zurich',
    centerLatitude: '46.6863',
    centerLongitude: '7.8632',
    radiusKm: '30',
  },
];

export function roomTitle(nameKo: string): string {
  return `${nameKo} 실시간 여행 도움방`;
}
