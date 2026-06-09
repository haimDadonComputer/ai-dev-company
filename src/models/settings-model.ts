import type { GeneralSettings } from "../types/app.js";

function getString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function settingsFromForm(
  form: HTMLFormElement,
  logoMediaId: number | null,
  imageMediaIds: number[]
): GeneralSettings {
  const formData = new FormData(form);
  return {
    siteName: getString(formData, "siteName"),
    slogan: getString(formData, "slogan"),
    phone: getString(formData, "phone"),
    address: getString(formData, "address"),
    whatsapp: getString(formData, "whatsapp"),
    instagram: getString(formData, "instagram"),
    email: getString(formData, "email"),
    logoMediaId,
    imageMediaIds
  };
}
