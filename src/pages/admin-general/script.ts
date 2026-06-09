import { mountAdminLayout } from "../../app/admin-layout.js";
import { setFormBusy, setFormMessage } from "../../components/form/script.js";
import { notify } from "../../components/notification/script.js";
import { settingsFromForm } from "../../models/settings-model.js";
import { mediaService } from "../../services/media-service.js";
import { settingsService } from "../../services/settings-service.js";
import type { GeneralSettings, MediaAsset } from "../../types/app.js";

function setFieldValue(form: HTMLFormElement, name: string, value: string): void {
  const field = form.elements.namedItem(name);
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    field.value = value;
  }
}

function renderLogoPreview(container: HTMLElement, asset?: MediaAsset): void {
  container.replaceChildren();
  if (!asset) {
    const message = document.createElement("p");
    message.className = "form-component__help";
    message.textContent = "לא נבחר לוגו.";
    container.append(message);
    return;
  }
  const image = document.createElement("img");
  image.src = asset.url;
  image.alt = asset.altText || `תצוגה מקדימה של ${asset.fileName}`;
  image.loading = "lazy";
  container.append(image);
}

function renderMediaOptions(
  select: HTMLSelectElement,
  options: HTMLElement,
  assets: MediaAsset[],
  settings: GeneralSettings
): void {
  assets.forEach((asset) => {
    const option = document.createElement("option");
    option.value = String(asset.id);
    option.textContent = asset.fileName;
    option.selected = settings.logoMediaId === asset.id;
    select.append(option);

    const label = document.createElement("label");
    label.className = "admin-general-page__image-option";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "imageMediaIds";
    checkbox.value = String(asset.id);
    checkbox.checked = settings.imageMediaIds.includes(asset.id);
    const image = document.createElement("img");
    image.src = asset.url;
    image.alt = asset.altText || asset.fileName;
    image.loading = "lazy";
    const name = document.createElement("span");
    name.textContent = asset.fileName;
    label.append(checkbox, image, name);
    options.append(label);
  });

  if (assets.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "עדיין לא הועלו תמונות למדיה.";
    options.append(empty);
  }
}

export async function mountAdminGeneralPage(root: HTMLElement): Promise<void> {
  const page = root.querySelector<HTMLElement>(".admin-general-page");
  if (!page) {
    throw new Error("מבנה עמוד ההגדרות אינו תקין.");
  }
  mountAdminLayout(root, page);

  const form = page.querySelector<HTMLFormElement>(".admin-general-page__form");
  const logoSelect = page.querySelector<HTMLSelectElement>("#logo-media");
  const logoPreview = page.querySelector<HTMLElement>(".admin-general-page__logo-preview");
  const imageOptions = page.querySelector<HTMLElement>(".admin-general-page__image-options");
  if (!form || !logoSelect || !logoPreview || !imageOptions) {
    throw new Error("שדות עמוד ההגדרות אינם תקינים.");
  }

  setFormBusy(form, true);
  try {
    const [settings, assets] = await Promise.all([
      settingsService.getGeneral(),
      mediaService.list()
    ]);
    setFieldValue(form, "siteName", settings.siteName);
    setFieldValue(form, "slogan", settings.slogan);
    setFieldValue(form, "phone", settings.phone);
    setFieldValue(form, "address", settings.address);
    setFieldValue(form, "whatsapp", settings.whatsapp);
    setFieldValue(form, "instagram", settings.instagram);
    setFieldValue(form, "email", settings.email);
    renderMediaOptions(logoSelect, imageOptions, assets, settings);
    renderLogoPreview(logoPreview, assets.find((asset) => asset.id === settings.logoMediaId));

    logoSelect.addEventListener("change", () => {
      const id = Number(logoSelect.value);
      renderLogoPreview(logoPreview, assets.find((asset) => asset.id === id));
    });
  } catch {
    setFormMessage(form, "לא ניתן לטעון את ההגדרות כרגע.");
  } finally {
    setFormBusy(form, false);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFormMessage(form);
    if (!form.reportValidity()) {
      return;
    }

    const selectedImages = Array.from(
      form.querySelectorAll<HTMLInputElement>('input[name="imageMediaIds"]:checked')
    ).map((input) => Number(input.value));
    const logoMediaId = logoSelect.value ? Number(logoSelect.value) : null;

    setFormBusy(form, true);
    try {
      await settingsService.updateGeneral(
        settingsFromForm(form, logoMediaId, selectedImages)
      );
      notify("ההגדרות נשמרו בהצלחה.", "success");
    } catch {
      setFormMessage(form, "שמירת ההגדרות נכשלה.");
    } finally {
      setFormBusy(form, false);
    }
  });
}
