import { ServiceError } from "../services/service-error.js";

export interface AdminActivityInput {
  name: string;
  activityType: string;
  audience: string;
  summary: string;
  description: string | null;
  imageMediaAssetId: number | null;
  priceAmount: string | null;
  publishOnSite: boolean;
  status: "active" | "inactive" | "archived";
}

export interface AdminGroupInput {
  activityId: number;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  scheduleText: string;
  capacity: number | null;
  registrationStatus: "open" | "closed" | "full" | "archived";
  publishOnSite: boolean;
  status: "active" | "inactive" | "archived";
  instructorUserId: number | null;
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

function optionalId(object: Record<string, unknown>, key: string): number | null {
  const value = object[key];
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (!Number.isSafeInteger(value) || Number(value) <= 0) {
    throw new ServiceError(400, "INVALID_BODY", `השדה ${key} אינו תקין`);
  }
  return Number(value);
}

function requireId(object: Record<string, unknown>, key: string): number {
  const value = optionalId(object, key);
  if (!value) {
    throw new ServiceError(400, "INVALID_BODY", `השדה ${key} אינו תקין`);
  }
  return value;
}

function optionalBoolean(object: Record<string, unknown>, key: string): boolean {
  const value = object[key];
  if (value === undefined) {
    return false;
  }
  if (typeof value !== "boolean") {
    throw new ServiceError(400, "INVALID_BODY", `השדה ${key} אינו תקין`);
  }
  return value;
}

function activityStatus(value: unknown): AdminActivityInput["status"] {
  if (value === "active" || value === "inactive" || value === "archived") {
    return value;
  }
  throw new ServiceError(400, "INVALID_STATUS", "סטטוס הפעילות אינו תקין");
}

function groupRegistrationStatus(
  value: unknown,
): AdminGroupInput["registrationStatus"] {
  if (
    value === "open" ||
    value === "closed" ||
    value === "full" ||
    value === "archived"
  ) {
    return value;
  }
  throw new ServiceError(400, "INVALID_STATUS", "סטטוס ההרשמה אינו תקין");
}

function optionalDate(object: Record<string, unknown>, key: string): string | null {
  const value = optionalString(object, key, 10);
  if (!value) {
    return null;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ServiceError(400, "INVALID_BODY", `השדה ${key} אינו תקין`);
  }
  return value;
}

function optionalCapacity(
  object: Record<string, unknown>,
  key: string,
): number | null {
  const value = object[key];
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (!Number.isSafeInteger(value) || Number(value) <= 0 || Number(value) > 100000) {
    throw new ServiceError(400, "INVALID_BODY", `השדה ${key} אינו תקין`);
  }
  return Number(value);
}

function optionalPrice(
  object: Record<string, unknown>,
  key: string,
): string | null {
  const value = object[key];
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (typeof value !== "string" && typeof value !== "number") {
    throw new ServiceError(400, "INVALID_BODY", `השדה ${key} אינו תקין`);
  }
  const text = String(value).trim();
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(text)) {
    throw new ServiceError(400, "INVALID_BODY", `השדה ${key} אינו תקין`);
  }
  return text;
}

export function validateAdminId(value: string | string[] | undefined): number {
  const raw = typeof value === "string" ? Number(value) : NaN;
  if (!Number.isInteger(raw) || raw <= 0) {
    throw new ServiceError(400, "INVALID_ID", "מזהה אינו תקין");
  }
  return raw;
}

export function validateActivityInput(value: unknown): AdminActivityInput {
  const object = requireObject(value);
  return {
    name: requireString(object, "name", 191),
    activityType: optionalString(object, "activityType", 100) ?? "",
    audience: optionalString(object, "audience", 255) ?? "",
    summary: optionalString(object, "summary", 500) ?? "",
    description: optionalString(object, "description", 10000),
    imageMediaAssetId: optionalId(object, "imageMediaAssetId"),
    priceAmount: optionalPrice(object, "priceAmount"),
    publishOnSite: optionalBoolean(object, "publishOnSite"),
    status: activityStatus(object.status ?? "active"),
  };
}

export function validateGroupInput(value: unknown): AdminGroupInput {
  const object = requireObject(value);
  return {
    activityId: requireId(object, "activityId"),
    name: requireString(object, "name", 191),
    description: optionalString(object, "description", 10000),
    startDate: optionalDate(object, "startDate"),
    endDate: optionalDate(object, "endDate"),
    scheduleText: optionalString(object, "scheduleText", 500) ?? "",
    capacity: optionalCapacity(object, "capacity"),
    registrationStatus: groupRegistrationStatus(object.registrationStatus ?? "open"),
    publishOnSite: optionalBoolean(object, "publishOnSite"),
    status: activityStatus(object.status ?? "active"),
    instructorUserId: optionalId(object, "instructorUserId"),
  };
}
