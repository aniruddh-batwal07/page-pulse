import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // If it's one of our typed errors, use its statusCode
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Fallback for unhandled/unexpected errors
  const message =
    err instanceof Error ? err.message : "An unexpected error occurred";

  res.status(500).json({
    success: false,
    error: message,
  });
}
