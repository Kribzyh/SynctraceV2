import type { NextFunction, Request, Response } from "express";

import { authConfig } from "../config/auth.js";
import { authService } from "../modules/auth/auth.service.js";
import { createHttpError } from "./errorHandler.js";

const readToken = (req: Request) => {
  const authorization = req.header("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length);
  }

  const cookieToken = req.cookies?.[authConfig.COOKIE_NAME];
  return typeof cookieToken === "string" ? cookieToken : null;
};

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = readToken(req);
    if (!token) {
      throw createHttpError(401, "UNAUTHORIZED", "Authentication token is required.");
    }

    const claims = authService.verifyToken(token);
    req.user = {
      userId: claims.userId,
      role: claims.role
    };

    next();
  } catch {
    next(createHttpError(401, "UNAUTHORIZED", "Invalid or expired authentication token."));
  }
};