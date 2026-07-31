function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export type RoomAccessStatus =
  | 'AVAILABLE'
  | 'TRAVELER_PENDING'
  | 'LOCAL_PENDING'
  | 'VERIFICATION_REQUIRED';

export interface RoomAccess {
  status: RoomAccessStatus;
  labelKo: '입장 가능' | '여행자 심사 중' | '현지인 심사 중' | '인증 필요';
  canViewContent: boolean;
  canAskQuestion: boolean;
  canAnswer: boolean;
}

export interface Destination {
  id: string;
  slug: string;
  nameKo: string;
  countryCode: string;
  timezone: string;
  center: {
    latitude: number;
    longitude: number;
  };
  radiusKm: number;
}

export interface Room {
  id: string;
  slug: string;
  title: string;
  destination: Destination;
  access: RoomAccess;
}

function parseAccess(value: unknown): RoomAccess {
  if (
    !isRecord(value) ||
    ![
      'AVAILABLE',
      'TRAVELER_PENDING',
      'LOCAL_PENDING',
      'VERIFICATION_REQUIRED',
    ].includes(String(value.status)) ||
    !['입장 가능', '여행자 심사 중', '현지인 심사 중', '인증 필요'].includes(
      String(value.labelKo),
    ) ||
    typeof value.canViewContent !== 'boolean' ||
    typeof value.canAskQuestion !== 'boolean' ||
    typeof value.canAnswer !== 'boolean'
  ) {
    throw new Error('방 접근 정보 형식이 올바르지 않습니다.');
  }

  const expectedLabels = {
    AVAILABLE: '입장 가능',
    TRAVELER_PENDING: '여행자 심사 중',
    LOCAL_PENDING: '현지인 심사 중',
    VERIFICATION_REQUIRED: '인증 필요',
  } as const;
  const status = value.status as RoomAccessStatus;
  if (
    value.canViewContent !== (status === 'AVAILABLE') ||
    value.labelKo !== expectedLabels[status] ||
    (status !== 'AVAILABLE' && (value.canAskQuestion || value.canAnswer))
  ) {
    throw new Error('방 접근 상태 값이 일치하지 않습니다.');
  }

  return {
    status,
    labelKo: value.labelKo as RoomAccess['labelKo'],
    canViewContent: value.canViewContent,
    canAskQuestion: value.canAskQuestion,
    canAnswer: value.canAnswer,
  };
}

function parseDestination(value: unknown): Destination {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.slug !== 'string' ||
    typeof value.nameKo !== 'string' ||
    typeof value.countryCode !== 'string' ||
    typeof value.timezone !== 'string' ||
    !isRecord(value.center) ||
    !isFiniteNumber(value.center.latitude) ||
    !isFiniteNumber(value.center.longitude) ||
    !isFiniteNumber(value.radiusKm)
  ) {
    throw new Error('여행지 정보 형식이 올바르지 않습니다.');
  }

  return {
    id: value.id,
    slug: value.slug,
    nameKo: value.nameKo,
    countryCode: value.countryCode,
    timezone: value.timezone,
    center: {
      latitude: value.center.latitude,
      longitude: value.center.longitude,
    },
    radiusKm: value.radiusKm,
  };
}

export function parseRoom(value: unknown): Room {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.slug !== 'string' ||
    typeof value.title !== 'string'
  ) {
    throw new Error('방 정보 형식이 올바르지 않습니다.');
  }

  return {
    id: value.id,
    slug: value.slug,
    title: value.title,
    destination: parseDestination(value.destination),
    access: parseAccess(value.access),
  };
}

export function parseRooms(value: unknown): Room[] {
  if (!Array.isArray(value)) {
    throw new Error('방 목록 형식이 올바르지 않습니다.');
  }

  return value.map(parseRoom);
}
