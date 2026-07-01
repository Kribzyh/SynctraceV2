import type { Role } from "@prisma/client";
import jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";

import { authConfig } from "../../config/auth.js";
import { createHttpError } from "../../middleware/errorHandler.js";
import { authRepository } from "./auth.repository.js";
import type { AuthMeResponse, AuthTokenClaims, AuthUserRecord, GoogleProfilePayload } from "./auth.types.js";

const toAuthUserSummary = (user: AuthUserRecord) => ({
  id: user.id,
  googleId: user.googleId,
  email: user.email,
  name: user.name,
  pictureUrl: user.pictureUrl,
  role: user.role,
  createdAt: user.createdAt
});

const signToken = (claims: AuthTokenClaims) =>
  jwt.sign(claims, authConfig.JWT_SECRET as Secret, {
    expiresIn: authConfig.JWT_EXPIRES_IN,
    issuer: "synctrace-backend",
    audience: "synctrace-frontend"
  } as SignOptions);

export const authService = {
  authenticateGoogleProfile: async (profile: GoogleProfilePayload) => {
    const existingUser = await authRepository.findUserByGoogleId(profile.googleId);
    const user =
      existingUser ??
      (await authRepository.createUser({
        googleId: profile.googleId,
        email: profile.email,
        name: profile.name,
        pictureUrl: profile.pictureUrl
      }));

    await authRepository.createLoginAuditLog(user.id, {
      provider: "google",
      googleId: profile.googleId,
      email: profile.email
    });

    return {
      user: toAuthUserSummary(user),
      token: signToken({ userId: user.id, role: user.role })
    };
  },

  completeProfile: async (userId: string, role: Role) => {
    const currentUser = await authRepository.findUserByIdWithMemberships(userId);
    if (!currentUser) {
      throw createHttpError(404, "USER_NOT_FOUND", "Authenticated user could not be found.");
    }

    if (currentUser.role) {
      throw createHttpError(409, "PROFILE_ALREADY_COMPLETE", "Profile has already been completed.");
    }

    const updatedUser = await authRepository.completeProfile(userId, role);

    return {
      user: toAuthUserSummary(updatedUser),
      token: signToken({ userId: updatedUser.id, role: updatedUser.role })
    };
  },

  getMe: async (userId: string): Promise<AuthMeResponse> => {
    const user = await authRepository.findUserByIdWithMemberships(userId);
    if (!user) {
      throw createHttpError(404, "USER_NOT_FOUND", "Authenticated user could not be found.");
    }

    return {
      user: toAuthUserSummary(user),
      hasWorkspace: user.projectMemberships.length > 0
    };
  },

  verifyToken: (token: string) =>
    jwt.verify(token, authConfig.JWT_SECRET as Secret, {
      issuer: "synctrace-backend",
      audience: "synctrace-frontend"
    }) as AuthTokenClaims,

  buildCookieOptions: () => ({
    httpOnly: true,
    sameSite: "lax" as const,
    secure: false,
    path: "/"
  }),

  createTokenResponse: (userId: string, role: Role | null) =>
    signToken({ userId, role })
};