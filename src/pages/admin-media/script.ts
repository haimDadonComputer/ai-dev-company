import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_SIZE } from "../../app/config.js";
import { mountAdminLayout } from "../../app/admin-layout.js";
import { setFormBusy, setFormMessage } from "../../components/form/script.js";
import { confirmModal } from "../../components/modal/script.js";
import { notify } from "../../components/notification/script.js";
import { mediaService } from "../../services/media-service.js";
import type { MediaAsset } from "../../types/app.js";

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.some((type) => type === file.type)) {
    return "סוג הקובץ אינו נתמך. ניתן להעלות PNG, JPEG או WebP בלבד.";
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    return "הקובץ גדול מ־5MB.";
  }
  return null;
}

function createMediaCard(asset: MediaAsset, onDelete: (asset: MediaAsset) => void): HTMLElement {
  const article = document.createElement("article");
  article.className = "admin-media-page__card card";

  const image = document.createElement("img");
  image.src = asset.url;
  image.alt = asset.altText || asset.fileName;
  image.loading = "lazy";

  const info = document.createElement("div");
  info.className = "admin-media-page__card-info";
  const name = document.createElement("h3");
  name.textContent = asset.fileName;
  const alt = document.createElement("p");
  alt.textContent = asset.altText;
  const size = document.createElement("span");
  size.className = "form-component__help";
  size.textContent = formatBytes(asset.size);

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "button-component button-component--danger";
  remove.textContent = "מחיקה";
  remove.setAttribute("aria-label", `מחיקת ${asset.fileName}`);
  remove.addEventListener("click", () => onDelete(asset));

  info.append(name, alt, size, remove);
  article.append(image, info);
  return article;
}

function renderGallery(
  container: HTMLElement,
  assets: MediaAsset[],
  onDelete: (asset: MediaAsset) => void
): void {
  container.replaceChildren();
  if (assets.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "ספריית המדיה ריקה.";
    container.append(empty);
    return;
  }
  assets.forEach((asset) => container.append(createMediaCard(asset, onDelete)));
}

export async function mountAdminMediaPage(root: HTMLElement): Promise<void> {
  const page = root.querySelector<HTMLElement>(".admin-media-page");
  if (!page) {
    throw new Error("מבנה עמוד המדיה אינו תקין.");
  }
  mountAdminLayout(root, page);

  const form = page.querySelector<HTMLFormElement>(".admin-media-page__upload");
  const fileInput = page.querySelector<HTMLInputElement>("#media-file");
  const altInput = page.querySelector<HTMLInputElement>("#media-alt");
  const status = page.querySelector<HTMLElement>(".admin-media-page__upload-status");
  const progress = page.querySelector<HTMLProgressElement>("#upload-progress");
  const statusText = page.querySelector<HTMLElement>(".admin-media-page__status-text");
  const gallery = page.querySelector<HTMLElement>(".admin-media-page__gallery");
  if (!form || !fileInput || !altInput || !status || !progress || !statusText || !gallery) {
    throw new Error("שדות עמוד המדיה אינם תקינים.");
  }

  let assets: MediaAsset[] = [];
  const deleteAsset = async (asset: MediaAsset): Promise<void> => {
    const confirmed = await confirmModal({
      title: "מחיקת תמונה",
      message: `האם למחוק את הקובץ "${asset.fileName}"?`,
      confirmLabel: "מחיקה"
    });
    if (!confirmed) {
      return;
    }
    try {
      await mediaService.remove(asset.id);
      assets = assets.filter((item) => item.id !== asset.id);
      renderGallery(gallery, assets, (item) => void deleteAsset(item));
      notify("התמונה נמחקה.", "success");
    } catch {
      notify("לא ניתן למחוק את התמונה. ייתכן שהיא נמצאת בשימוש.", "error");
    }
  };

  try {
    assets = await mediaService.list();
    renderGallery(gallery, assets, (asset) => void deleteAsset(asset));
  } catch {
    gallery.innerHTML = '<p class="empty-state" role="alert">לא ניתן לטעון את ספריית המדיה.</p>';
  }

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    setFormMessage(form, file ? validateFile(file) ?? "" : "");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFormMessage(form);
    const file = fileInput.files?.[0];
    if (!file || !form.reportValidity()) {
      return;
    }
    const validationError = validateFile(file);
    if (validationError) {
      setFormMessage(form, validationError);
      return;
    }

    status.hidden = false;
    progress.removeAttribute("value");
    statusText.textContent = "מעלה את התמונה...";
    setFormBusy(form, true);
    try {
      const uploaded = await mediaService.upload(file, altInput.value.trim());
      assets = [uploaded, ...assets];
      renderGallery(gallery, assets, (asset) => void deleteAsset(asset));
      progress.value = 100;
      statusText.textContent = "ההעלאה הושלמה.";
      form.reset();
      notify("התמונה הועלתה בהצלחה.", "success");
    } catch {
      statusText.textContent = "ההעלאה נכשלה.";
      setFormMessage(form, "לא ניתן להעלות את התמונה.");
    } finally {
      setFormBusy(form, false);
    }
  });
}
