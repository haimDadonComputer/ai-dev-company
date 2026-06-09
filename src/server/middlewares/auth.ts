import type { NextFunction, Request, Response } from "express";
import { AUTH_COOKIE, readCookie } from "../utils/cookies.js";
import { sendError } from "../utils/http.js";
import { verifyToken } from "../utils/jwt.js";

export function requireAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const token = readCookie(request, AUTH_COOKIE);
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    sendError(response, 401, "AUTH_REQUIRED", "נדרשת התחברות");
    return;
  }

  request.auth = {
    userId: payload.sub,
    role: payload.role,
    mustChangePassword: payload.mustChangePassword
  };
  next();
}

export function requireAdmin(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  requireAuthenticated(request, response, () => {
    if (request.auth?.role !== "admin") {
      sendError(response, 403, "ADMIN_REQUIRED", "נדרשת הרשאת מנהל");
      return;
    }
    next();
  });
}

export function requirePasswordChanged(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (request.auth?.mustChangePassword) {
    sendError(response, 403, "PASSWORD_CHANGE_REQUIRED", "יש להחליף סיסמה לפני המשך");
    return;
  }
  next();
}
