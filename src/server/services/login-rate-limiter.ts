import { ServiceError } from "./service-error.js";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

interface AttemptWindow {
  count: number;
  resetAt: number;
}

const attempts = new Map<string, AttemptWindow>();

export function loginRateLimitKey(ip: string, username: string): string {
  return `${ip}|${username.trim().toLocaleLowerCase("en-US")}`;
}

export function assertLoginAllowed(key: string): void {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.delete(key);
    return;
  }
  if (current.count >= MAX_ATTEMPTS) {
    throw new ServiceError(
      429,
      "TOO_MANY_LOGIN_ATTEMPTS",
      "בוצעו יותר מדי ניסיונות התחברות. יש לנסות שוב מאוחר יותר",
    );
  }
}

export function recordLoginFailure(key: string): void {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  current.count += 1;
}

export function clearLoginFailures(key: string): void {
  attempts.delete(key);
}
