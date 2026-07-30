import type { UserRole } from '@prisma/client';
import type { AuthenticatedUser } from '../authenticated-user';

export interface VerificationSummaryResponse {
  traveler: null;
  local: null;
}

export interface CurrentUserResponse {
  id: string;
  email: string;
  nickname: string;
  role: UserRole;
  isAdmin: boolean;
  createdAt: string;
  verificationSummary: VerificationSummaryResponse;
}

export function toCurrentUserResponse(
  user: AuthenticatedUser,
): CurrentUserResponse {
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    role: user.role,
    isAdmin: user.role === 'ADMIN',
    createdAt: user.createdAt.toISOString(),
    verificationSummary: {
      traveler: null,
      local: null,
    },
  };
}
