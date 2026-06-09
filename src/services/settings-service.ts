import { apiRequest } from "./api.js";
import type { GeneralSettings } from "../types/app.js";

interface ApiGeneralSettings {
  siteName?: string;
  slogan?: string;
  phone?: string;
  address?: string;
  whatsapp?: string;
  instagram?: string;
  email?: string;
  logoMediaAssetId?: number | null;
  additionalMediaAssetIds?: number[];
}

interface SettingsResponse {
  settings: ApiGeneralSettings;
}

const emptySettings: GeneralSettings = {
  siteName: "",
  slogan: "",
  phone: "",
  address: "",
  whatsapp: "",
  instagram: "",
  email: "",
  logoMediaId: null,
  imageMediaIds: []
};

function normalizeSettings(settings: ApiGeneralSettings): GeneralSettings {
  return {
    ...emptySettings,
    ...settings,
    logoMediaId: settings.logoMediaAssetId ?? null,
    imageMediaIds: settings.additionalMediaAssetIds ?? []
  };
}

export const settingsService = {
  async getGeneral(): Promise<GeneralSettings> {
    const response = await apiRequest<SettingsResponse>("/api/admin/settings/general");
    return normalizeSettings(response.settings);
  },

  async updateGeneral(settings: GeneralSettings): Promise<GeneralSettings> {
    const response = await apiRequest<SettingsResponse>("/api/admin/settings/general", {
      method: "PUT",
      body: {
        siteName: settings.siteName,
        slogan: settings.slogan,
        phone: settings.phone,
        address: settings.address,
        whatsapp: settings.whatsapp,
        instagram: settings.instagram,
        email: settings.email,
        logoMediaAssetId: settings.logoMediaId,
        additionalMediaAssetIds: settings.imageMediaIds
      }
    });
    return normalizeSettings(response.settings);
  }
};
