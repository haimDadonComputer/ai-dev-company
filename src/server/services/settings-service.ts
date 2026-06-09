import {
  findMediaAssetById,
  getSiteSettings,
  updateSiteSettings,
  type SiteSettingsRecord,
  type SiteSettingsUpdate,
} from "../../../agents/db/domain/repo.js";
import { ServiceError } from "./service-error.js";

export interface SettingsResponse {
  siteName: string;
  slogan: string;
  phone: string;
  address: string;
  whatsapp: string;
  instagram: string;
  email: string;
  logoMediaAssetId: number | null;
  logoUrl: string | null;
  additionalMediaAssetIds: number[];
  additionalMediaUrls: string[];
  updatedAt: Date;
  updatedByUserId?: number | null;
}

function mediaUrl(id: number): string {
  return `/api/media/${id}`;
}

function toResponse(
  settings: SiteSettingsRecord,
  includeUpdatedBy: boolean,
): SettingsResponse {
  const additionalIds = settings.additionalMediaAssetIds ?? [];
  const response: SettingsResponse = {
    siteName: settings.siteName,
    slogan: settings.slogan,
    phone: settings.phone,
    address: settings.address,
    whatsapp: settings.whatsapp,
    instagram: settings.instagram,
    email: settings.email,
    logoMediaAssetId: settings.logoMediaAssetId,
    logoUrl: settings.logoMediaAssetId
      ? mediaUrl(settings.logoMediaAssetId)
      : null,
    additionalMediaAssetIds: additionalIds,
    additionalMediaUrls: additionalIds.map(mediaUrl),
    updatedAt: settings.updatedAt,
  };
  if (includeUpdatedBy) {
    response.updatedByUserId = settings.updatedByUserId;
  }
  return response;
}

async function requireSettings(): Promise<SiteSettingsRecord> {
  const settings = await getSiteSettings();
  if (!settings) {
    throw new ServiceError(500, "SETTINGS_NOT_INITIALIZED", "הגדרות האתר לא אותחלו");
  }
  return settings;
}

async function validateActiveMedia(update: SiteSettingsUpdate): Promise<void> {
  const ids = new Set<number>();
  if (update.logoMediaAssetId) {
    ids.add(update.logoMediaAssetId);
  }
  for (const id of update.additionalMediaAssetIds ?? []) {
    ids.add(id);
  }

  for (const id of ids) {
    if (!(await findMediaAssetById(id))) {
      throw new ServiceError(
        400,
        "MEDIA_NOT_ACTIVE",
        `נכס המדיה ${id} אינו קיים או אינו פעיל`,
      );
    }
  }
}

export async function getAdminSettings(): Promise<SettingsResponse> {
  return toResponse(await requireSettings(), true);
}

export async function getPublicSettings(): Promise<SettingsResponse> {
  return toResponse(await requireSettings(), false);
}

export async function saveSettings(
  actorUserId: number,
  update: SiteSettingsUpdate,
): Promise<SettingsResponse> {
  await validateActiveMedia(update);
  const settings = await updateSiteSettings(actorUserId, update);
  if (!settings) {
    throw new ServiceError(500, "SETTINGS_UPDATE_FAILED", "עדכון ההגדרות נכשל");
  }
  return toResponse(settings, true);
}
