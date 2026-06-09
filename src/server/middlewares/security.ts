import type { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { sendError } from "../utils/http.js";

export function securityHeaders(
  _request: Request,
  response: Response,
  next: NextFunction
): void {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'"
  );
  next();
}

export function sameOrigin(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    next();
    return;
  }

  const origin = request.headers.origin;
  if (origin && origin !== config.appOrigin) {
    sendError(response, 403, "INVALID_ORIGIN", "מקור הבקשה אינו מורשה");
    return;
  }
  next();
}
