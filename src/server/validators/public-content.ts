import { ServiceError } from "../services/service-error.js";

export function validatePublicId(value: string | string[] | undefined): number {
  const raw = typeof value === "string" ? Number(value) : NaN;
  if (!Number.isInteger(raw) || raw <= 0) {
    throw new ServiceError(400, "INVALID_PUBLIC_ID", "מזהה ציבורי אינו תקין");
  }
  return raw;
}
