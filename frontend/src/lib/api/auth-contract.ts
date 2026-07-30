function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export type UserRole = 'USER' | 'ADMIN';

export interface CurrentUser {
  id: string;
  email: string;
  nickname: string;
  role: UserRole;
  isAdmin: boolean;
  createdAt: string;
  verificationSummary: {
    traveler: null;
    local: null;
  };
}

export function parseCurrentUser(value: unknown): CurrentUser {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.email !== 'string' ||
    typeof value.nickname !== 'string' ||
    (value.role !== 'USER' && value.role !== 'ADMIN') ||
    typeof value.isAdmin !== 'boolean' ||
    typeof value.createdAt !== 'string' ||
    !isRecord(value.verificationSummary) ||
    value.verificationSummary.traveler !== null ||
    value.verificationSummary.local !== null
  ) {
    throw new Error('인증 응답 형식이 올바르지 않습니다.');
  }

  const createdAt = new Date(value.createdAt);
  if (
    Number.isNaN(createdAt.getTime()) ||
    createdAt.toISOString() !== value.createdAt ||
    value.isAdmin !== (value.role === 'ADMIN')
  ) {
    throw new Error('인증 응답 값이 올바르지 않습니다.');
  }

  return {
    id: value.id,
    email: value.email,
    nickname: value.nickname,
    role: value.role,
    isAdmin: value.isAdmin,
    createdAt: value.createdAt,
    verificationSummary: {
      traveler: null,
      local: null,
    },
  };
}
