import type { NextFunction, Request, Response } from "express";
import {
  changePassword,
  getAuthenticatedUser,
  login,
} from "../services/auth-service.js";
import {
  assertLoginAllowed,
  clearLoginFailures,
  loginRateLimitKey,
  recordLoginFailure,
} from "../services/login-rate-limiter.js";
import { ServiceError } from "../services/service-error.js";
import { clearAuthCookie, setAuthCookie } from "../utils/cookies.js";
import { sendSuccess } from "../utils/http.js";
import {
  validateChangePasswordInput,
  validateLoginInput,
} from "../validators/auth.js";
import { handleControllerError } from "./error-response.js";

export async function loginController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  let rateLimitKey: string | null = null;
  try {
    const input = validateLoginInput(request.body);
    rateLimitKey = loginRateLimitKey(request.ip ?? "unknown", input.username);
    assertLoginAllowed(rateLimitKey);
    const result = await login(input.username, input.password);
    clearLoginFailures(rateLimitKey);
    setAuthCookie(response, result.token);
    sendSuccess(response, {
      user: result.user,
      mustChangePassword: result.user.mustChangePassword,
    });
  } catch (error) {
    if (
      rateLimitKey &&
      error instanceof ServiceError &&
      error.code === "INVALID_CREDENTIALS"
    ) {
      recordLoginFailure(rateLimitKey);
    }
    handleControllerError(error, response, next);
  }
}

export function logoutController(
  _request: Request,
  response: Response,
): void {
  clearAuthCookie(response);
  sendSuccess(response, { loggedOut: true });
}

export async function meController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await getAuthenticatedUser(request.auth!.userId);
    sendSuccess(response, { user });
  } catch (error) {
    clearAuthCookie(response);
    handleControllerError(error, response, next);
  }
}

export async function changePasswordController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = validateChangePasswordInput(request.body);
    const result = await changePassword(
      request.auth!.userId,
      input.currentPassword,
      input.newPassword,
    );
    setAuthCookie(response, result.token);
    sendSuccess(response, { user: result.user });
  } catch (error) {
    handleControllerError(error, response, next);
  }
}
