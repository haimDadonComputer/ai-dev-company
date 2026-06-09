import type { Request } from "express";
import { basename } from "node:path";
import { ServiceError } from "../services/service-error.js";

export interface UploadHeaders {
  originalName: string;
  altText: string | null;
}

function singleHeader(request: Request, name: string): string | undefined {
  const value = request.headers[name];
  return Array.isArray(value) ? undefined : value;
}

function decodeHeader(value: string, errorCode: string, message: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    throw new ServiceError(400, errorCode, message);
  }
}

export function validateUploadHeaders(request: Request): UploadHeaders {
  if (!request.is("application/octet-stream")) {
    throw new ServiceError(
      415,
      "UNSUPPORTED_CONTENT_TYPE",
      "יש לשלוח קובץ מסוג application/octet-stream",
    );
  }

  const rawName = singleHeader(request, "x-file-name")?.trim();
  if (!rawName) {
    throw new ServiceError(400, "FILE_NAME_REQUIRED", "חסר שם הקובץ");
  }

  const decodedName = decodeHeader(
    rawName,
    "INVALID_FILE_NAME",
    "שם הקובץ אינו תקין"
  );

  const originalName = basename(decodedName).replace(
    /[\u0000-\u001f\u007f]/g,
    "",
  );
  if (!originalName || Buffer.byteLength(originalName, "utf8") > 255) {
    throw new ServiceError(400, "INVALID_FILE_NAME", "שם הקובץ אינו תקין");
  }

  const encodedAltText = singleHeader(request, "x-alt-text")?.trim() || null;
  const altText = encodedAltText
    ? decodeHeader(encodedAltText, "INVALID_ALT_TEXT", "הטקסט החלופי אינו תקין").trim()
    : null;
  if (altText && Buffer.byteLength(altText, "utf8") > 500) {
    throw new ServiceError(400, "ALT_TEXT_TOO_LONG", "הטקסט החלופי ארוך מדי");
  }

  return { originalName, altText: altText || null };
}

export function validateMediaId(value: string): number {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ServiceError(400, "INVALID_MEDIA_ID", "מזהה המדיה אינו תקין");
  }
  return id;
}
