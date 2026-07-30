import type { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      nickname: string;
      role: UserRole;
      createdAt: Date;
    }

    interface Request {
      requestId?: string;
    }
  }
}

export {};
