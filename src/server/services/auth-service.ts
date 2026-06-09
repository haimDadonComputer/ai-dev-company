import {
  findUserById,
  findUserByUsername,
  updateUserPassword,
  type UserRecord,
} from "../../../agents/db/domain/repo.js";
import { createToken } from "../utils/jwt.js";
import type { UserRole } from "../utils/jwt.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { ServiceError } from "./service-error.js";

export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  mustChangePassword: boolean;
}

function toAuthUser(user: UserRecord): AuthUser {
  const role = toUserRole(user.roleName);
  return {
    id: user.id,
    username: user.username,
    role,
    firstName: user.firstName,
    lastName: user.lastName,
    mustChangePassword: user.mustChangePassword,
  };
}

function toUserRole(roleName: string): UserRole {
  if (
    roleName !== "student" &&
    roleName !== "instructor" &&
    roleName !== "admin"
  ) {
    throw new ServiceError(401, "INVALID_CREDENTIALS", "שם המשתמש או הסיסמה שגויים");
  }
  return roleName;
}

function assertActiveUser(user: UserRecord | null): UserRecord {
  if (!user || !user.isActive || user.status !== "active") {
    throw new ServiceError(401, "INVALID_CREDENTIALS", "שם המשתמש או הסיסמה שגויים");
  }
  toUserRole(user.roleName);
  return user;
}

export async function login(
  username: string,
  password: string,
): Promise<{ token: string; user: AuthUser }> {
  const user = assertActiveUser(await findUserByUsername(username));
  if (!(await verifyPassword(password, user.passwordHash, user.passwordSalt))) {
    throw new ServiceError(401, "INVALID_CREDENTIALS", "שם המשתמש או הסיסמה שגויים");
  }

  return {
    token: createToken(user.id, toUserRole(user.roleName), user.mustChangePassword),
    user: toAuthUser(user),
  };
}

export async function getAuthenticatedUser(userId: number): Promise<AuthUser> {
  const user = assertActiveUser(await findUserById(userId));
  return toAuthUser(user);
}

export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
): Promise<{ token: string; user: AuthUser }> {
  const user = assertActiveUser(await findUserById(userId));
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

  const role = toUserRole(user.roleName);
  const authenticatedUser: AuthUser = {
    id: user.id,
    username: user.username,
    role,
    firstName: user.firstName,
    lastName: user.lastName,
    mustChangePassword: false,
  };
  return {
    token: createToken(user.id, role, false),
    user: authenticatedUser,
  };
}
