import type { Request } from "express";
import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, open, rename, unlink } from "node:fs/promises";
import { join } from "node:path";
import {
  createMediaAsset,
  findMediaAssetById,
  getSiteSettings,
  listMediaAssets,
  softDeleteMediaAsset,
  type MediaAssetRecord,
} from "../../../agents/db/domain/repo.js";
import { config } from "../config.js";
import type { UploadHeaders } from "../validators/media.js";
import { ServiceError } from "./service-error.js";

interface DetectedImage {
  mimeType: "image/png" | "image/jpeg" | "image/webp";
  extension: "png" | "jpg" | "webp";
}

export interface MediaResponse {
  id: number;
  originalName: string;
  mimeType: string;
  extension: string;
  sizeBytes: number;
  sha256: string;
  altText: string | null;
  uploadedByUserId: number;
  createdAt: Date;
  url: string;
}

function toResponse(asset: MediaAssetRecord): MediaResponse {
  return {
    id: asset.id,
    originalName: asset.originalName,
    mimeType: asset.mimeType,
    extension: asset.extension,
    sizeBytes: asset.sizeBytes,
    sha256: asset.sha256,
    altText: asset.altText,
    uploadedByUserId: asset.uploadedByUserId,
    createdAt: asset.createdAt,
    url: `/api/media/${asset.id}`,
  };
}

function detectImage(header: Buffer): DetectedImage | null {
  if (
    header.length >= 8 &&
    header.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    )
  ) {
    return { mimeType: "image/png", extension: "png" };
  }
  if (
    header.length >= 3 &&
    header[0] === 0xff &&
    header[1] === 0xd8 &&
    header[2] === 0xff
  ) {
    return { mimeType: "image/jpeg", extension: "jpg" };
  }
  if (
    header.length >= 12 &&
    header.subarray(0, 4).toString("ascii") === "RIFF" &&
    header.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { mimeType: "image/webp", extension: "webp" };
  }
  return null;
}

export async function uploadMedia(
  request: Request,
  headers: UploadHeaders,
  actorUserId: number,
): Promise<MediaResponse> {
  const declaredLength = Number(request.headers["content-length"] ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > config.maxUploadBytes) {
    throw new ServiceError(413, "FILE_TOO_LARGE", "הקובץ גדול מהמגבלה המותרת");
  }

  await mkdir(config.uploadDir, { recursive: true });
  const temporaryPath = join(config.uploadDir, `.upload-${randomUUID()}.tmp`);
  const handle = await open(temporaryPath, "wx");
  const hash = createHash("sha256");
  const headerChunks: Buffer[] = [];
  let headerLength = 0;
  let sizeBytes = 0;
  let finalPath: string | null = null;

  try {
    for await (const rawChunk of request) {
      const chunk = Buffer.isBuffer(rawChunk) ? rawChunk : Buffer.from(rawChunk);
      sizeBytes += chunk.length;
      if (sizeBytes > config.maxUploadBytes) {
        request.resume();
        throw new ServiceError(413, "FILE_TOO_LARGE", "הקובץ גדול מהמגבלה המותרת");
      }
      if (headerLength < 12) {
        const part = chunk.subarray(0, 12 - headerLength);
        headerChunks.push(part);
        headerLength += part.length;
      }
      hash.update(chunk);
      await handle.write(chunk);
    }

    if (sizeBytes === 0) {
      throw new ServiceError(400, "EMPTY_FILE", "לא התקבל תוכן קובץ");
    }

    const detected = detectImage(Buffer.concat(headerChunks));
    if (!detected) {
      throw new ServiceError(
        415,
        "UNSUPPORTED_FILE",
        "ניתן להעלות קובצי PNG, JPEG או WebP בלבד",
      );
    }

    await handle.close();
    const storageName = `${randomUUID()}.${detected.extension}`;
    const destinationPath = join(config.uploadDir, storageName);
    await rename(temporaryPath, destinationPath);
    finalPath = destinationPath;

    try {
      const asset = await createMediaAsset({
        originalName: headers.originalName,
        storageName,
        storagePath: finalPath,
        mimeType: detected.mimeType,
        extension: detected.extension,
        sizeBytes,
        sha256: hash.digest("hex"),
        altText: headers.altText,
        uploadedByUserId: actorUserId,
      });
      return toResponse(asset);
    } catch (error) {
      await unlink(finalPath).catch(() => undefined);
      throw error;
    }
  } finally {
    await handle.close().catch(() => undefined);
    if (!finalPath) {
      await unlink(temporaryPath).catch(() => undefined);
    }
  }
}

export async function getMediaList(): Promise<MediaResponse[]> {
  return (await listMediaAssets()).map(toResponse);
}

export async function getActiveMedia(id: number): Promise<MediaAssetRecord> {
  const asset = await findMediaAssetById(id);
  if (!asset) {
    throw new ServiceError(404, "MEDIA_NOT_FOUND", "המדיה לא נמצאה");
  }
  return asset;
}

export function createMediaReadStream(asset: MediaAssetRecord) {
  return createReadStream(asset.storagePath);
}

export async function deleteMedia(id: number, actorUserId: number): Promise<void> {
  const asset = await findMediaAssetById(id);
  if (!asset) {
    throw new ServiceError(404, "MEDIA_NOT_FOUND", "המדיה לא נמצאה");
  }

  const settings = await getSiteSettings();
  const linked =
    settings?.logoMediaAssetId === id ||
    (settings?.additionalMediaAssetIds ?? []).includes(id);
  if (linked) {
    throw new ServiceError(
      409,
      "MEDIA_IN_USE",
      "לא ניתן למחוק מדיה שמקושרת להגדרות האתר",
    );
  }

  if (!(await softDeleteMediaAsset(id, actorUserId))) {
    throw new ServiceError(409, "MEDIA_DELETE_FAILED", "מחיקת המדיה נכשלה");
  }
}
