import type { ErrorRequestHandler } from "express";

export interface ApiError extends Error {
  statusCode: number;
  code: string;
  fields?: Record<string, string[]>;
}

export const createHttpError = (
  statusCode: number,
  code: string,
  message: string,
  fields?: Record<string, string[]>
): ApiError => {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.code = code;
  if (fields !== undefined) {
    error.fields = fields;
  }
  return error;
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const apiError = error as Partial<ApiError>;
  const statusCode = apiError.statusCode ?? 500;
  const code = apiError.code ?? (statusCode === 500 ? "INTERNAL_SERVER_ERROR" : "HTTP_ERROR");
  const message =
    process.env.NODE_ENV === "production" && statusCode === 500
      ? "An unexpected error occurred."
      : apiError.message ?? "Unexpected error";

  res.status(statusCode).json({
    error: {
      code,
      message,
      ...(apiError.fields ? { fields: apiError.fields } : {})
    }
  });
};