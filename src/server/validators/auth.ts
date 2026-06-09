import { validateNewPassword } from "../utils/password.js";
import { ServiceError } from "../services/service-error.js";

interface LoginInput {
  username: string;
  password: string;
}

interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

function requireObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ServiceError(400, "INVALID_BODY", "גוף הבקשה אינו תקין");
  }
  return value as Record<string, unknown>;
}

function requireString(
  object: Record<string, unknown>,
  key: string,
  maxLength: number,
): string {
  const value = object[key];
  if (typeof value !== "string" || value.length === 0 || value.length > maxLength) {
    throw new ServiceError(400, "INVALID_BODY", `השדה ${key} אינו תקין`);
  }
  return value;
}

export function validateLoginInput(value: unknown): LoginInput {
  const object = requireObject(value);
  const username = requireString(object, "username", 191).trim();
  if (!username) {
    throw new ServiceError(400, "INVALID_BODY", "שם המשתמש אינו תקין");
  }
  return {
    username,
    password: requireString(object, "password", 1024),
  };
}

export function validateChangePasswordInput(value: unknown): ChangePasswordInput {
  const object = requireObject(value);
  const currentPassword = requireString(object, "currentPassword", 1024);
  const newPassword = requireString(object, "newPassword", 1024);
  const passwordError = validateNewPassword(newPassword);

  if (passwordError) {
    throw new ServiceError(400, "WEAK_PASSWORD", passwordError);
  }
  if (currentPassword === newPassword) {
    throw new ServiceError(
      400,
      "PASSWORD_UNCHANGED",
      "הסיסמה החדשה חייבת להיות שונה מהסיסמה הנוכחית",
    );
  }

  return { currentPassword, newPassword };
}
