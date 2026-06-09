import { apiRequest } from "./api.js";
import type { MediaAsset } from "../types/app.js";

interface MediaListResponse {
  media: ApiMediaAsset[];
}

interface MediaUploadResponse {
  media: ApiMediaAsset;
}

interface ApiMediaAsset {
  id: number;
  originalName: string;
  altText: string | null;
  mimeType: MediaAsset["mimeType"];
  sizeBytes: number;
  url: string;
  createdAt?: string;
}

function normalizeMedia(asset: ApiMediaAsset): MediaAsset {
  return {
    id: asset.id,
    fileName: asset.originalName,
    altText: asset.altText ?? "",
    mimeType: asset.mimeType,
    size: asset.sizeBytes,
    url: asset.url,
    createdAt: asset.createdAt
  };
}

export const mediaService = {
  async list(): Promise<MediaAsset[]> {
    const response = await apiRequest<MediaListResponse>("/api/admin/media");
    return response.media.map(normalizeMedia);
  },

  async upload(file: File, altText: string): Promise<MediaAsset> {
    const response = await apiRequest<MediaUploadResponse>("/api/admin/media", {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "X-File-Name": encodeURIComponent(file.name),
        "X-Alt-Text": encodeURIComponent(altText)
      },
      body: file
    });
    return normalizeMedia(response.media);
  },

  remove(id: number): Promise<void> {
    return apiRequest<void>(`/api/admin/media/${encodeURIComponent(String(id))}`, {
      method: "DELETE"
    });
  }
};
