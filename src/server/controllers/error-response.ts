import type { NextFunction, Response } from "express";
import { sendError } from "../utils/http.js";
import { ServiceError } from "../services/service-error.js";

export function handleControllerError(
  error: unknown,
  response: Response,
  next: NextFunction,
): void {
  if (error instanceof ServiceError) {
    sendError(response, error.status, error.code, error.message);
    return;
  }
  next(error);
}
