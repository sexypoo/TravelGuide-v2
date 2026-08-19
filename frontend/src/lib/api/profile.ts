import type { UserRole } from './auth-contract';
import { requestForm, requestJson, requestVoid } from './client';
import { isIsoDate, isRecord } from './runtime';

export const TRAVEL_STYLES = [
  'FOOD_EXPLORER',
  'SLOW_TRAVEL',
  'NATURE',
  'CULTURE_ART',
  'ACTIVITY',
  'NIGHTLIFE',
  'SHOPPING',
  'PHOTO',
  'SOLO',
  'FAMILY',
] as const;

export type TravelStyle = (typeof TRAVEL_STYLES)[number];

export const travelStyleLabels: Readonly<Record<TravelStyle, string>> = {
  FOOD_EXPLORER: '맛집 탐방',
  SLOW_TRAVEL: '느린 여행',
  NATURE: '자연·휴양',
  CULTURE_ART: '문화·예술',
  ACTIVITY: '액티비티',
  NIGHTLIFE: '야간 여행',
  SHOPPING: '쇼핑',
  PHOTO: '사진 여행',
  SOLO: '혼자 여행',
  FAMILY: '가족 여행',
};

export const travelStyleEmojis: Readonly<Record<TravelStyle, string>> = {
  FOOD_EXPLORER: '🍜',
  SLOW_TRAVEL: '🌿',
  NATURE: '🏔️',
  CULTURE_ART: '🎨',
  ACTIVITY: '🏄',
  NIGHTLIFE: '🌙',
  SHOPPING: '🛍️',
  PHOTO: '📷',
  SOLO: '🎒',
  FAMILY: '👨‍👩‍👧',
};

export interface OwnProfile {
  id: string;
  email: string;
  nickname: string;
  bio: string | null;
  travelStyles: TravelStyle[];
  profileImageUrl: string | null;
  role: UserRole;
  isAdmin: boolean;
  hasPassword: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicContributorProfile {
  id: string;
  nickname: string;
  bio: string | null;
  profileImageUrl: string | null;
  isVerifiedLocal: boolean;
  verifiedDestination: {
    id: string;
    slug: string;
    nameKo: string;
  } | null;
  verifiedAt: string | null;
  joinedAt: string;
  stats: {
    answerCount: number;
    acceptedAnswerCount: number;
  };
}

export interface UpdateProfileInput {
  nickname: string;
  bio: string | null;
  travelStyles: TravelStyle[];
}

function isTravelStyle(value: unknown): value is TravelStyle {
  return (
    typeof value === 'string' &&
    (TRAVEL_STYLES as readonly string[]).includes(value)
  );
}

export function parseOwnProfile(value: unknown): OwnProfile {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.email !== 'string' ||
    typeof value.nickname !== 'string' ||
    (value.bio !== null && typeof value.bio !== 'string') ||
    (value.profileImageUrl !== null &&
      typeof value.profileImageUrl !== 'string') ||
    !Array.isArray(value.travelStyles) ||
    value.travelStyles.length > 5 ||
    !value.travelStyles.every(isTravelStyle) ||
    (value.role !== 'USER' && value.role !== 'ADMIN') ||
    typeof value.isAdmin !== 'boolean' ||
    typeof value.hasPassword !== 'boolean' ||
    typeof value.createdAt !== 'string' ||
    typeof value.updatedAt !== 'string' ||
    !isIsoDate(value.createdAt) ||
    !isIsoDate(value.updatedAt) ||
    value.isAdmin !== (value.role === 'ADMIN')
  ) {
    throw new Error('프로필 응답 형식이 올바르지 않습니다.');
  }

  return {
    id: value.id,
    email: value.email,
    nickname: value.nickname,
    bio: value.bio,
    travelStyles: [...new Set(value.travelStyles)],
    profileImageUrl: value.profileImageUrl,
    role: value.role,
    isAdmin: value.isAdmin,
    hasPassword: value.hasPassword,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

export function parsePublicContributorProfile(
  value: unknown,
): PublicContributorProfile {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.nickname !== 'string' ||
    (value.bio !== null && typeof value.bio !== 'string') ||
    (value.profileImageUrl !== null &&
      typeof value.profileImageUrl !== 'string') ||
    typeof value.isVerifiedLocal !== 'boolean' ||
    typeof value.joinedAt !== 'string' ||
    !isIsoDate(value.joinedAt) ||
    (value.verifiedAt !== null &&
      (typeof value.verifiedAt !== 'string' || !isIsoDate(value.verifiedAt))) ||
    !isRecord(value.stats) ||
    !Number.isInteger(value.stats.answerCount) ||
    !Number.isInteger(value.stats.acceptedAnswerCount) ||
    Number(value.stats.answerCount) < 0 ||
    Number(value.stats.acceptedAnswerCount) < 0
  ) {
    throw new Error('공개 프로필 응답 형식이 올바르지 않습니다.');
  }
  const destination = value.verifiedDestination;
  if (
    destination !== null &&
    (!isRecord(destination) ||
      typeof destination.id !== 'string' ||
      typeof destination.slug !== 'string' ||
      typeof destination.nameKo !== 'string')
  ) {
    throw new Error('공개 프로필 응답 형식이 올바르지 않습니다.');
  }
  if (
    value.isVerifiedLocal !== (destination !== null) ||
    (value.isVerifiedLocal && value.verifiedAt === null)
  ) {
    throw new Error('공개 프로필 응답 형식이 올바르지 않습니다.');
  }
  const verifiedDestination =
    destination === null
      ? null
      : {
          id: String(destination.id),
          slug: String(destination.slug),
          nameKo: String(destination.nameKo),
        };

  return {
    id: value.id,
    nickname: value.nickname,
    bio: value.bio,
    profileImageUrl: value.profileImageUrl,
    isVerifiedLocal: value.isVerifiedLocal,
    verifiedDestination,
    verifiedAt: value.verifiedAt,
    joinedAt: value.joinedAt,
    stats: {
      answerCount: Number(value.stats.answerCount),
      acceptedAnswerCount: Number(value.stats.acceptedAnswerCount),
    },
  };
}

export async function updateOwnProfile(
  input: UpdateProfileInput,
): Promise<OwnProfile> {
  const value = await requestJson('/api/v1/users/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return parseOwnProfile(value);
}

export async function updateOwnProfileImage(image: File): Promise<OwnProfile> {
  const body = new FormData();
  body.set('image', image);
  const value = await requestForm('/api/v1/users/me/avatar', body, {
    method: 'POST',
  });
  return parseOwnProfile(value);
}

export async function removeOwnProfileImage(): Promise<OwnProfile> {
  const value = await requestJson('/api/v1/users/me/avatar', {
    method: 'DELETE',
  });
  return parseOwnProfile(value);
}

export async function deleteOwnAccount(input: {
  confirmation: string;
  password?: string;
}): Promise<void> {
  await requestVoid('/api/v1/auth/account', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}
