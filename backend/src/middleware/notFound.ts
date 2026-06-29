import type { RequestHandler } from "express";

import { createHttpError } from "./errorHandler.js";

export const notFound: RequestHandler = (req, _res, next) => {
  next(
    createHttpError(
      404,
      "NOT_FOUND",
      `Route ${req.method} ${req.originalUrl} was not found.`
    )
  );
};