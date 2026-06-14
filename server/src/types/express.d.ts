import type { UserRole, UserStatus } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        dbUserId: string;
        firebaseUid: string;
        email: string;
        name?: string;
        picture?: string;
        role: UserRole;
        status: UserStatus;
      };
    }
  }
}

export {};
