import type { Request, Response } from "express";
import { config } from "../config.js";

export const AUTH_COOKIE = "admin_session";

export function readCookie(request: Request, name: string): string | null {
  const raw = request.headers.cookie;
  if (!raw) {
    return null;
  }

  for (const item of raw.split(";")) {
    const [key, ...valueParts] = item.trim().split("=");
    if (key === name) {
      return decodeURIComponent(valueParts.join("="));
    }
  }
  return null;
}

export function setAuthCookie(response: Response, token: string): void {
  response.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "strict",
    maxAge: config.jwtTtlSeconds * 1000,
    path: "/"
  });
}

export function clearAuthCookie(response: Response): void {
  response.clearCookie(AUTH_COOKIE, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "strict",
    path: "/"
  });
}
