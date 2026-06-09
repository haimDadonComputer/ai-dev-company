import {
  createUserWithProfile,
  findUserByUsername,
  findUserWithProfileById,
  listUsers,
  updateUserIdentity,
  updateUserPassword,
  updateUserStatus,
  type UserRecord,
  type UserWithProfile,
} from "../../../agents/db/domain/repo.js";
import { hashPassword } from "../utils/password.js";
import { ServiceError } from "./service-error.js";
import type {
  CreateUserInput,
  ListUsersQuery,
  UpdateUserInput,
} from "../validators/users.js";
import type { UserStatus } from "../utils/jwt.js";

export interface UserResponse {
  id: number;
  username: string;
  role: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: string;
  mustChangePassword: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfileResponse {
  user: UserResponse;
  student: UserWithProfile["student"];
  instructor: UserWithProfile["instructor"];
}

function toUserResponse(user: UserRecord): UserResponse {
  return {
    id: user.id,
    username: user.username,
    role: user.roleName,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    email: user.email,
    status: user.status,
    mustChangePassword: user.mustChangePassword,
    notes: user.notes,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function toProfileResponse(profile: UserWithProfile): UserProfileResponse {
  return {
    user: toUserResponse(profile.user),
    student: profile.student,
    instructor: profile.instructor,
  };
}

function mapDuplicateError(error: unknown): never {
  const sqlError = error as { code?: string };
  if (sqlError.code === "ER_DUP_ENTRY") {
    throw new ServiceError(409, "USER_ALREADY_EXISTS", "משתמש עם נתונים אלה כבר קיים");
  }
  throw error;
}

export async function getUsers(
  query: ListUsersQuery,
): Promise<UserResponse[]> {
  const users = await listUsers({
    limit: query.limit,
    offset: query.offset,
    roleName: query.role,
    status: query.status,
  });
  return users.map(toUserResponse);
}

export async function getUser(id: number): Promise<UserProfileResponse> {
  const profile = await findUserWithProfileById(id);
  if (!profile) {
    throw new ServiceError(404, "USER_NOT_FOUND", "המשתמש לא נמצא");
  }
  return toProfileResponse(profile);
}

export async function createUser(
  input: CreateUserInput,
): Promise<UserProfileResponse> {
  const existing = await findUserByUsername(input.username);
  if (existing) {
    throw new ServiceError(409, "USER_ALREADY_EXISTS", "שם המשתמש כבר קיים");
  }

  const password = await hashPassword(input.password);
  try {
    return toProfileResponse(
      await createUserWithProfile({
        username: input.username,
        passwordHash: password.hash,
        passwordSalt: password.salt,
        roleName: input.role,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        email: input.email,
        notes: input.notes,
        student: input.student,
        instructor: input.instructor,
      }),
    );
  } catch (error) {
    mapDuplicateError(error);
  }
}

export async function updateUser(
  id: number,
  input: UpdateUserInput,
): Promise<UserProfileResponse> {
  try {
    const updated = await updateUserIdentity(id, input);
    if (!updated) {
      throw new ServiceError(404, "USER_NOT_FOUND", "המשתמש לא נמצא");
    }
    return toProfileResponse(updated);
  } catch (error) {
    mapDuplicateError(error);
  }
}

export async function resetUserPassword(
  id: number,
  newPassword: string,
): Promise<UserResponse> {
  const user = await findUserWithProfileById(id);
  if (!user) {
    throw new ServiceError(404, "USER_NOT_FOUND", "המשתמש לא נמצא");
  }
  const password = await hashPassword(newPassword);
  const updated = await updateUserPassword(id, password.hash, password.salt, true);
  if (!updated) {
    throw new ServiceError(500, "PASSWORD_RESET_FAILED", "איפוס הסיסמה נכשל");
  }
  const reloaded = await findUserWithProfileById(id);
  if (!reloaded) {
    throw new ServiceError(500, "USER_RELOAD_FAILED", "טעינת המשתמש נכשלה");
  }
  return toUserResponse(reloaded.user);
}

export async function changeUserStatus(
  id: number,
  status: UserStatus,
): Promise<UserResponse> {
  const updated = await updateUserStatus(id, status);
  if (!updated) {
    throw new ServiceError(404, "USER_NOT_FOUND", "המשתמש לא נמצא");
  }
  return toUserResponse(updated);
}
