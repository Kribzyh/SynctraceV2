import type { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface User {
      userId: string;
      role: Role | null;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};