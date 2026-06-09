import {
  findUserById,
  findUserByUsername,
  updateUserPassword,
  type UserRecord,
} from "../../../agents/db/domain/repo.js";
import { createToken } from "../utils/jwt.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { ServiceError } from "./service-error.js";

export interface AuthUser {
  id: number;
  username: string;
  role: "admin";
  mustChangePassword: boolean;
}

function toAuthUser(user: UserRecord): AuthUser {
  return {
    id: user.id,
    username: user.username,
    role: "admin",
    mustChangePassword: user.mustChangePassword,
  };
}

function assertActiveAdmin(user: UserRecord | null): UserRecord {
  if (!user || !user.isActive || user.roleName !== "admin") {
    throw new ServiceError(401, "INVALID_CREDENTIALS", "שם המשתמש או הסיסמה שגויים");
  }
  return user;
}

export async function login(
  username: string,
  password: string,
): Promise<{ token: string; user: AuthUser }> {
  const user = assertActiveAdmin(await findUserByUsername(username));
  if (!(await verifyPassword(password, user.passwordHash, user.passwordSalt))) {
    throw new ServiceError(401, "INVALID_CREDENTIALS", "שם המשתמש או הסיסמה שגויים");
  }

  return {
    token: createToken(user.id, "admin", user.mustChangePassword),
    user: toAuthUser(user),
  };
}

export async function getAuthenticatedUser(userId: number): Promise<AuthUser> {
  const user = assertActiveAdmin(await findUserById(userId));
  return toAuthUser(user);
}

export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
): Promise<{ token: string; user: AuthUser }> {
  const user = assertActiveAdmin(await findUserById(userId));
  if (
    !(await verifyPassword(currentPassword, user.passwordHash, user.passwordSalt))
  ) {
    throw new ServiceError(
      400,
      "INVALID_CURRENT_PASSWORD",
      "הסיסמה הנוכחית אינה נכונה",
    );
  }

  const digest = await hashPassword(newPassword);
  const updated = await updateUserPassword(user.id, digest.hash, digest.salt, false);
  if (!updated) {
    throw new ServiceError(500, "PASSWORD_UPDATE_FAILED", "עדכון הסיסמה נכשל");
  }

  const authenticatedUser: AuthUser = {
    id: user.id,
    username: user.username,
    role: "admin",
    mustChangePassword: false,
  };
  return {
    token: createToken(user.id, "admin", false),
    user: authenticatedUser,
  };
}
