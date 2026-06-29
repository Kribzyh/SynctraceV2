import type { NextFunction, Request, Response } from "express";

import { authConfig } from "../../config/auth.js";
import { createHttpError } from "../../middleware/errorHandler.js";
import { authService } from "./auth.service.js";
import { completeProfileSchema } from "./auth.schema.js";

export const authController = {
  googleLogin: (_req: Request, res: Response) => {
    // This is handled by Passport middleware in the router.
    res.sendStatus(204);
  },

  googleCallback: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profile = res.locals.googleProfile as
        | { googleId: string; email: string; name: string; pictureUrl: string | null }
        | undefined;

      if (!profile) {
        throw createHttpError(401, "GOOGLE_AUTH_FAILED", "Google authentication failed.");
      }

      const authResult = await authService.authenticateGoogleProfile(profile);

      res.cookie(authConfig.COOKIE_NAME, authResult.token, authService.buildCookieOptions());
      res.json({
        user: authResult.user,
        token: authResult.token,
        requiresProfileCompletion: authResult.user.role === null
      });
    } catch (error) {
      next(error);
    }
  },

  completeProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = completeProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        throw createHttpError(400, "VALIDATION_ERROR", "Invalid profile payload.", {
          role: parsed.error.flatten().fieldErrors.role ?? ["Role is required."]
        });
      }

      if (!req.user) {
        throw createHttpError(401, "UNAUTHORIZED", "Authentication token is required.");
      }

      const authResult = await authService.completeProfile(req.user.userId, parsed.data.role);

      res.cookie(authConfig.COOKIE_NAME, authResult.token, authService.buildCookieOptions());
      res.json({ user: authResult.user, token: authResult.token });
    } catch (error) {
      next(error);
    }
  },

  logout: (_req: Request, res: Response) => {
    res.clearCookie(authConfig.COOKIE_NAME, authService.buildCookieOptions());
    res.status(204).send();
  },

  me: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw createHttpError(401, "UNAUTHORIZED", "Authentication token is required.");
      }

      const me = await authService.getMe(req.user.userId);
      res.json(me);
    } catch (error) {
      next(error);
    }
  }
};