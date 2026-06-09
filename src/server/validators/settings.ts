import type { SiteSettingsUpdate } from "../../../agents/db/domain/repo.js";
import { ServiceError } from "../services/service-error.js";

const stringLimits: Record<string, number> = {
  siteName: 191,
  slogan: 255,
  phone: 50,
  address: 500,
  whatsapp: 100,
  instagram: 255,
  email: 254,
};

const allowedKeys = new Set([
  ...Object.keys(stringLimits),
  "logoMediaAssetId",
  "additionalMediaAssetIds",
]);

function validateMediaId(value: unknown, fieldName: string): number | null {
  if (value === null) {
    return null;
  }
  if (!Number.isSafeInteger(value) || Number(value) <= 0) {
    throw new ServiceError(400, "INVALID_SETTINGS", `השדה ${fieldName} אינו תקין`);
  }
  return Number(value);
}

export function validateSettingsInput(value: unknown): SiteSettingsUpdate {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ServiceError(400, "INVALID_SETTINGS", "גוף ההגדרות אינו תקין");
  }

  const object = value as Record<string, unknown>;
  for (const key of Object.keys(object)) {
    if (!allowedKeys.has(key)) {
      throw new ServiceError(400, "INVALID_SETTINGS", `השדה ${key} אינו נתמך`);
    }
  }

  const result: SiteSettingsUpdate = {};
  for (const [key, limit] of Object.entries(stringLimits)) {
    const fieldValue = object[key];
    if (fieldValue === undefined) {
      continue;
    }
    if (typeof fieldValue !== "string" || fieldValue.length > limit) {
      throw new ServiceError(400, "INVALID_SETTINGS", `השדה ${key} ארוך או לא תקין`);
    }
    Object.assign(result, { [key]: fieldValue.trim() });
  }

  if (result.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email)) {
    throw new ServiceError(400, "INVALID_EMAIL", "כתובת האימייל אינה תקינה");
  }

  if (object.logoMediaAssetId !== undefined) {
    result.logoMediaAssetId = validateMediaId(
      object.logoMediaAssetId,
      "logoMediaAssetId",
    );
  }

  if (object.additionalMediaAssetIds !== undefined) {
    const ids = object.additionalMediaAssetIds;
    if (ids === null) {
      result.additionalMediaAssetIds = null;
    } else {
      if (
        !Array.isArray(ids) ||
        ids.length > 100 ||
        !ids.every((id) => Number.isSafeInteger(id) && Number(id) > 0)
      ) {
        throw new ServiceError(
          400,
          "INVALID_SETTINGS",
          "רשימת התמונות הנוספות אינה תקינה",
        );
      }
      result.additionalMediaAssetIds = [...new Set(ids.map(Number))];
    }
  }

  return result;
}
