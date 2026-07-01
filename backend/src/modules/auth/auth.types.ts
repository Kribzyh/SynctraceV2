import type { Role, User } from "@prisma/client";

export interface GoogleProfilePayload {
  googleId: string;
  email: string;
  name: string;
  pictureUrl: string | null;
}

export interface AuthTokenClaims {
  userId: string;
  role: Role | null;
}

export interface AuthenticatedUserSummary {
  id: string;
  googleId: string;
  email: string;
  name: string;
  pictureUrl: string | null;
  role: Role | null;
  createdAt: Date;
}

export interface AuthMeResponse {
  user: AuthenticatedUserSummary;
  hasWorkspace: boolean;
}

export type AuthUserRecord = Pick<
  User,
  "id" | "googleId" | "email" | "name" | "pictureUrl" | "role" | "createdAt"
>;