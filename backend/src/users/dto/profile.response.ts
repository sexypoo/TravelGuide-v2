import type { UserRole } from '@prisma/client';
import type { OwnProfileRecord, PublicProfileRecord } from '../users.service';
import type { TravelStyle } from '../travel-styles';

export interface OwnProfileResponse {
  id: string;
  email: string;
  nickname: string;
  bio: string | null;
  travelStyles: TravelStyle[];
  profileImageUrl: string | null;
  role: UserRole;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicProfileResponse {
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

export function toOwnProfileResponse(
  user: OwnProfileRecord,
): OwnProfileResponse {
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    bio: user.bio,
    travelStyles: user.travelStyles,
    profileImageUrl:
      user.avatarObjectKey === null ? null : `/api/v1/users/${user.id}/avatar`,
    role: user.role,
    isAdmin: user.role === 'ADMIN',
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function toPublicProfileResponse(
  user: PublicProfileRecord,
): PublicProfileResponse {
  const localVerification = user.verifications[0];
  return {
    id: user.id,
    nickname: user.nickname,
    bio: user.bio,
    profileImageUrl:
      user.avatarObjectKey === null ? null : `/api/v1/users/${user.id}/avatar`,
    isVerifiedLocal: localVerification !== undefined,
    verifiedDestination: localVerification?.destination ?? null,
    verifiedAt: localVerification?.reviewedAt?.toISOString() ?? null,
    joinedAt: user.createdAt.toISOString(),
    stats: user.stats,
  };
}
