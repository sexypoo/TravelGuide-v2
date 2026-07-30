import type { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  nickname: string;
  role: UserRole;
  createdAt: Date;
}
