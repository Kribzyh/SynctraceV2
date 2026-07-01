import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";

import { createHttpError } from "./errorHandler.js";

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      next(createHttpError(403, "FORBIDDEN", "You do not have permission to access this route."));
      return;
    }

    next();
  };
};