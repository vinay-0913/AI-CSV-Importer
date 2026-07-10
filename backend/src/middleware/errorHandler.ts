import type { Request, Response, NextFunction } from "express";
import type { APIResponse } from "../types/index.js";

/**
 * Custom error class with HTTP status code.
 */
export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

/**
 * Global error handling middleware.
 * Catches all errors and returns a standardized JSON response.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("Error:", err.message);

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message =
    err instanceof AppError ? err.message : "Internal server error";

  const response: APIResponse = {
    success: false,
    error: message,
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === "development") {
    (response as unknown as Record<string, unknown>).stack = err.stack;
  }

  res.status(statusCode).json(response);
}

/**
 * Wrapper to catch async errors in route handlers.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
