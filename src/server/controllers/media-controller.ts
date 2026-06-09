import type { NextFunction, Request, Response } from "express";
import {
  createMediaReadStream,
  deleteMedia,
  getActiveMedia,
  getMediaList,
  uploadMedia,
} from "../services/media-service.js";
import { sendSuccess } from "../utils/http.js";
import { validateMediaId, validateUploadHeaders } from "../validators/media.js";
import { handleControllerError } from "./error-response.js";

function routeParameter(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export async function uploadMediaController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const headers = validateUploadHeaders(request);
    const media = await uploadMedia(request, headers, request.auth!.userId);
    sendSuccess(response, { media }, 201);
  } catch (error) {
    handleControllerError(error, response, next);
  }
}

export async function listMediaController(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    sendSuccess(response, { media: await getMediaList() });
  } catch (error) {
    handleControllerError(error, response, next);
  }
}

export async function deleteMediaController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = validateMediaId(routeParameter(request.params.id));
    await deleteMedia(id, request.auth!.userId);
    sendSuccess(response, { deleted: true, id });
  } catch (error) {
    handleControllerError(error, response, next);
  }
}

export async function getMediaController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const asset = await getActiveMedia(
      validateMediaId(routeParameter(request.params.id)),
    );
    response.setHeader("Content-Type", asset.mimeType);
    response.setHeader("Content-Length", String(asset.sizeBytes));
    response.setHeader("Cache-Control", "public, max-age=86400, immutable");
    response.setHeader("ETag", `"${asset.sha256}"`);

    const stream = createMediaReadStream(asset);
    stream.on("error", (error) => {
      if (!response.headersSent) {
        next(error);
      } else {
        response.destroy(error);
      }
    });
    stream.pipe(response);
  } catch (error) {
    handleControllerError(error, response, next);
  }
}
