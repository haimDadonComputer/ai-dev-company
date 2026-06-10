import { ServiceError } from "../services/service-error.js";

export type LeadStatus = "new" | "contacted" | "closed" | "archived";

export interface PublicLeadInput {
  activityId: number | null;
  groupId: number | null;
  fullName: string;
  phone: string;
  email: string | null;
  message: string | null;
  sourcePath: string;
}

export interface ListLeadsQuery {
  limit?: number;
  offset?: number;
  status?: LeadStatus;
}

function requireObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ServiceError(400, "INVALID_BODY", "גוף הבקשה אינו תקין");
  }
  return value as Record<string, unknown>;
}

function optionalInteger(
  object: Record<string, unknown>,
  key: string,
): number | null {
  const value = object[key];
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new ServiceError(400, "INVALID_BODY", `השדה ${key} אינו תקין`);
  }
  return value;
}

function requireString(
  object: Record<string, unknown>,
  key: string,
  maxLength: number,
): string {
  const value = object[key];
  if (typeof value !== "string") {
    throw new ServiceError(400, "INVALID_BODY", `השדה ${key} אינו תקין`);
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) {
    throw new ServiceError(400, "INVALID_BODY", `השדה ${key} אינו תקין`);
  }
  return trimmed;
}

function optionalString(
  object: Record<string, unknown>,
  key: string,
  maxLength: number,
): string | null {
  const value = object[key];
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== "string") {
    throw new ServiceError(400, "INVALID_BODY", `השדה ${key} אינו תקין`);
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new ServiceError(400, "INVALID_BODY", `השדה ${key} אינו תקין`);
  }
  return trimmed || null;
}

function optionalLeadStatus(value: unknown): LeadStatus | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }
  if (
    value === "new" ||
    value === "contacted" ||
    value === "closed" ||
    value === "archived"
  ) {
    return value;
  }
  throw new ServiceError(400, "INVALID_QUERY", "סטטוס הפנייה אינו תקין");
}

export function validatePublicLeadInput(value: unknown): PublicLeadInput {
  const object = requireObject(value);
  return {
    activityId: optionalInteger(object, "activityId"),
    groupId: optionalInteger(object, "groupId"),
    fullName: requireString(object, "fullName", 191),
    phone: requireString(object, "phone", 50),
    email: optionalString(object, "email", 254),
    message: optionalString(object, "message", 5000),
    sourcePath: optionalString(object, "sourcePath", 255) ?? "",
  };
}

export function validateListLeadsQuery(
  query: Record<string, unknown>,
): ListLeadsQuery {
  const result: ListLeadsQuery = {};
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
  result.status = optionalLeadStatus(query.status);
  return result;
}
