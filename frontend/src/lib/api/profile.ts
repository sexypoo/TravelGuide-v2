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
