import { ServiceError } from "../services/service-error.js";
import { validateNewPassword } from "../utils/password.js";
import type { UserRole, UserStatus } from "../utils/jwt.js";

export interface CreateUserInput {
  username: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  notes: string | null;
  student?: {
    nationalId: string | null;
    birthDate: string | null;
    fullAddress: string;
  };
  instructor?: {
    expertiseAreas: string | null;
    biography: string | null;
    resumeFileId: number | null;
    certificationFileIds: number[] | null;
    notes: string | null;
  };
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  notes?: string | null;
  student?: {
    nationalId?: string | null;
    birthDate?: string | null;
    fullAddress?: string;
  };
  instructor?: {
    expertiseAreas?: string | null;
    biography?: string | null;
    resumeFileId?: number | null;
    certificationFileIds?: number[] | null;
    notes?: string | null;
  };
}

export interface ListUsersQuery {
  limit?: number;
  offset?: number;
  role?: UserRole;
  status?: UserStatus;
}

function requireObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ServiceError(400, "INVALID_BODY", "גוף הבקשה אינו תקין");
  }
  return value as Record<string, unknown>;
}

function optionalObject(value: unknown, key: string): Record<string, unknown> | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ServiceError(400, "INVALID_BODY", `השדה ${key} אינו תקין`);
  }
  return value as Record<string, unknown>;
}

function requireString(
  object: Record<string, unknown>,
  key: string,
  maxLength: number,
): string {
  const value = object[key];
  if (typeof value !== "string" || value.trim().length === 0 || value.length > maxLength) {
    throw new ServiceError(400, "INVALID_BODY", `השדה ${key} אינו תקין`);
  }
  return value.trim();
}

function optionalString(
  object: Record<string, unknown>,
  key: string,
  maxLength: number,
): string | null | undefined {
  const value = object[key];
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  if (typeof value !== "string" || value.length > maxLength) {
    throw new ServiceError(400, "INVALID_BODY", `השדה ${key} אינו תקין`);
  }
  return value.trim();
}

function optionalInteger(
  object: Record<string, unknown>,
  key: string,
): number | null | undefined {
  const value = object[key];
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new ServiceError(400, "INVALID_BODY", `השדה ${key} אינו תקין`);
  }
  return value;
}

function optionalIntegerArray(
  object: Record<string, unknown>,
  key: string,
): number[] | null | undefined {
  const value = object[key];
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  if (
    !Array.isArray(value) ||
    !value.every((item) => Number.isInteger(item) && item > 0)
  ) {
    throw new ServiceError(400, "INVALID_BODY", `השדה ${key} אינו תקין`);
  }
  return value;
}

function requireRole(value: unknown): UserRole {
  if (value === "student" || value === "instructor" || value === "admin") {
    return value;
  }
  throw new ServiceError(400, "INVALID_ROLE", "תפקיד המשתמש אינו תקין");
}

function requireStatus(value: unknown): UserStatus {
  if (value === "active" || value === "inactive" || value === "archived") {
    return value;
  }
  throw new ServiceError(400, "INVALID_STATUS", "סטטוס המשתמש אינו תקין");
}

function optionalDateString(
  object: Record<string, unknown>,
  key: string,
): string | null | undefined {
  const value = optionalString(object, key, 10);
  if (value === undefined || value === null || value === "") {
    return value === "" ? null : value;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ServiceError(400, "INVALID_BODY", `השדה ${key} אינו תקין`);
  }
  return value;
}

export function validateUserId(value: string | string[] | undefined): number {
  const raw = typeof value === "string" ? Number(value) : NaN;
  if (!Number.isInteger(raw) || raw <= 0) {
    throw new ServiceError(400, "INVALID_USER_ID", "מזהה המשתמש אינו תקין");
  }
  return raw;
}

export function validateListUsersQuery(
  query: Record<string, unknown>,
): ListUsersQuery {
  const result: ListUsersQuery = {};
  if (query.limit !== undefined) {
    const limit = Number(query.limit);
    if (!Number.isInteger(limit) || limit <= 0 || limit > 200) {
      throw new ServiceError(400, "INVALID_QUERY", "limit אינו תקין");
    }
    result.limit = limit;
  }
  if (query.offset !== undefined) {
    const offset = Number(query.offset);
    if (!Number.isInteger(offset) || offset < 0) {
      throw new ServiceError(400, "INVALID_QUERY", "offset אינו תקין");
    }
    result.offset = offset;
  }
  if (query.role !== undefined) {
    result.role = requireRole(query.role);
  }
  if (query.status !== undefined) {
    result.status = requireStatus(query.status);
  }
  return result;
}

export function validateCreateUserInput(value: unknown): CreateUserInput {
  const object = requireObject(value);
  const role = requireRole(object.role);
  const password = requireString(object, "password", 1024);
  const passwordError = validateNewPassword(password);
  if (passwordError) {
    throw new ServiceError(400, "WEAK_PASSWORD", passwordError);
  }

  const input: CreateUserInput = {
    username: requireString(object, "username", 191),
    password,
    role,
    firstName: requireString(object, "firstName", 100),
    lastName: requireString(object, "lastName", 100),
    phone: optionalString(object, "phone", 50) ?? "",
    email: optionalString(object, "email", 254) ?? "",
    notes: optionalString(object, "notes", 5000) ?? null,
  };

  if (role === "student") {
    const student = optionalObject(object.student, "student") ?? {};
    input.student = {
      nationalId: optionalString(student, "nationalId", 30) ?? null,
      birthDate: optionalDateString(student, "birthDate") ?? null,
      fullAddress: optionalString(student, "fullAddress", 500) ?? "",
    };
  }

  if (role === "instructor") {
    const instructor = optionalObject(object.instructor, "instructor") ?? {};
    input.instructor = {
      expertiseAreas: optionalString(instructor, "expertiseAreas", 5000) ?? null,
      biography: optionalString(instructor, "biography", 10000) ?? null,
      resumeFileId: optionalInteger(instructor, "resumeFileId") ?? null,
      certificationFileIds:
        optionalIntegerArray(instructor, "certificationFileIds") ?? null,
      notes: optionalString(instructor, "notes", 5000) ?? null,
    };
  }

  return input;
}

export function validateUpdateUserInput(value: unknown): UpdateUserInput {
  const object = requireObject(value);
  const input: UpdateUserInput = {};
  const firstName = optionalString(object, "firstName", 100);
  const lastName = optionalString(object, "lastName", 100);
  const phone = optionalString(object, "phone", 50);
  const email = optionalString(object, "email", 254);
  const notes = optionalString(object, "notes", 5000);

  if (firstName !== undefined) {
    if (!firstName) {
      throw new ServiceError(400, "INVALID_BODY", "שם פרטי אינו תקין");
    }
    input.firstName = firstName;
  }
  if (lastName !== undefined) {
    if (!lastName) {
      throw new ServiceError(400, "INVALID_BODY", "שם משפחה אינו תקין");
    }
    input.lastName = lastName;
  }
  if (phone !== undefined) {
    input.phone = phone ?? "";
  }
  if (email !== undefined) {
    input.email = email ?? "";
  }
  if (notes !== undefined) {
    input.notes = notes;
  }

  const student = optionalObject(object.student, "student");
  if (student) {
    input.student = {};
    const nationalId = optionalString(student, "nationalId", 30);
    const birthDate = optionalDateString(student, "birthDate");
    const fullAddress = optionalString(student, "fullAddress", 500);
    if (nationalId !== undefined) {
      input.student.nationalId = nationalId;
    }
    if (birthDate !== undefined) {
      input.student.birthDate = birthDate;
    }
    if (fullAddress !== undefined) {
      input.student.fullAddress = fullAddress ?? "";
    }
  }

  const instructor = optionalObject(object.instructor, "instructor");
  if (instructor) {
    input.instructor = {};
    const expertiseAreas = optionalString(instructor, "expertiseAreas", 5000);
    const biography = optionalString(instructor, "biography", 10000);
    const resumeFileId = optionalInteger(instructor, "resumeFileId");
    const certificationFileIds = optionalIntegerArray(
      instructor,
      "certificationFileIds",
    );
    const instructorNotes = optionalString(instructor, "notes", 5000);
    if (expertiseAreas !== undefined) {
      input.instructor.expertiseAreas = expertiseAreas;
    }
    if (biography !== undefined) {
      input.instructor.biography = biography;
    }
    if (resumeFileId !== undefined) {
      input.instructor.resumeFileId = resumeFileId;
    }
    if (certificationFileIds !== undefined) {
      input.instructor.certificationFileIds = certificationFileIds;
    }
    if (instructorNotes !== undefined) {
      input.instructor.notes = instructorNotes;
    }
  }

  return input;
}

export function validateResetPasswordInput(value: unknown): string {
  const object = requireObject(value);
  const password = requireString(object, "newPassword", 1024);
  const passwordError = validateNewPassword(password);
  if (passwordError) {
    throw new ServiceError(400, "WEAK_PASSWORD", passwordError);
  }
  return password;
}

export function validateStatusInput(value: unknown): UserStatus {
  const object = requireObject(value);
  return requireStatus(object.status);
}
