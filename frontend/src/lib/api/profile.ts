import { problemFromResponse } from './problem-details';
import type { UserRole } from './auth-contract';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isIsoDate(value: string): boolean {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.toISOString() === value;
}

export interface OwnProfile {
  id: string;
  email: string;
  nickname: string;
  bio: string | null;
  role: UserRole;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicContributorProfile {
  id: string;
  nickname: string;
  bio: string | null;
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
}

export function parseOwnProfile(value: unknown): OwnProfile {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.email !== 'string' ||
    typeof value.nickname !== 'string' ||
    (value.bio !== null && typeof value.bio !== 'string') ||
    (value.role !== 'USER' && value.role !== 'ADMIN') ||
    typeof value.isAdmin !== 'boolean' ||
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
    role: value.role,
    isAdmin: value.isAdmin,
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
  const response = await fetch('/api/v1/users/me', {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await problemFromResponse(response);
  }

  return parseOwnProfile(await response.json());
}
