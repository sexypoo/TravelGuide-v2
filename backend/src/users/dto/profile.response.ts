import type { UserRole } from '@prisma/client';
import type { OwnProfileRecord, PublicProfileRecord } from '../users.service';

export interface OwnProfileResponse {
  id: string;
  email: string;
  nickname: string;
  bio: string | null;
  role: UserRole;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicProfileResponse {
  id: string;
  nickname: string;
  isVerifiedLocal: false;
  verifiedDestination: null;
  verifiedAt: null;
}

export function toOwnProfileResponse(
  user: OwnProfileRecord,
): OwnProfileResponse {
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    bio: user.bio,
    role: user.role,
    isAdmin: user.role === 'ADMIN',
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function toPublicProfileResponse(
  user: PublicProfileRecord,
): PublicProfileResponse {
  return {
    id: user.id,
    nickname: user.nickname,
    isVerifiedLocal: false,
    verifiedDestination: null,
    verifiedAt: null,
  };
}
