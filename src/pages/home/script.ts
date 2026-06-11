import { activitiesService } from "../../services/activities-service.js";
import { setFormBusy, setFormMessage } from "../../components/form/script.js";
import { leadsService } from "../../services/leads-service.js";
import { settingsService } from "../../services/settings-service.js";
import type { GeneralSettings, PublicActivity } from "../../types/app.js";

function setText(root: HTMLElement, selector: string, text: string): void {
  const element = root.querySelector<HTMLElement>(selector);
  if (element) {
    element.textContent = text;
  }
}

function createActivityCard(activity: PublicActivity): HTMLElement {
  const article = document.createElement("article");
  article.className = "home-page__activity-card";

  if (activity.imageUrl) {
    const image = document.createElement("img");
    image.src = activity.imageUrl;
    image.alt = activity.name;
    image.loading = "lazy";
    article.append(image);
  }

  const body = document.createElement("div");
  const type = document.createElement("span");
  type.className = "home-page__activity-type";
  type.textContent = activity.activityType || "פעילות";
  const title = document.createElement("h3");
  title.textContent = activity.name;
  const summary = document.createElement("p");
  summary.textContent = activity.summary;
  const link = document.createElement("a");
  link.href = `/activities?activity=${encodeURIComponent(String(activity.id))}`;
  link.dataset.link = "";
  link.textContent = "צפייה בקבוצות";
  body.append(type, title, summary, link);
  article.append(body);
  return article;
}

function renderActivities(container: HTMLElement, activities: PublicActivity[]): void {
  container.replaceChildren();
  const visible = activities.slice(0, 3);
  if (visible.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "עדיין אין פעילויות שמפורסמות באתר.";
    container.append(empty);
    return;
  }
  visible.forEach((activity) => container.append(createActivityCard(activity)));
}

function renderSettings(page: HTMLElement, settings: GeneralSettings): void {
  const siteName = settings.siteName || "המרכז הדיגיטלי";
  setText(page, ".home-page__brand-text", siteName);
  setText(page, ".home-page__title", settings.siteName || "המרכז הדיגיטלי");
  setText(page, ".home-page__footer-name", siteName);
  setText(
    page,
    ".home-page__intro",
    settings.slogan || "מרחב לימוד טכנולוגי לקורסים, סדנאות וקבוצות דיגיטליות."
  );
  setText(page, ".home-page__phone", settings.phone || "-");
  setText(page, ".home-page__address", settings.address || "-");
  setText(page, ".home-page__email", settings.email || "-");

  const heroMedia = page.querySelector<HTMLElement>(".home-page__hero-media");
  const heroImage = settings.imageUrls?.[0] ?? settings.logoUrl ?? null;
  if (heroMedia && heroImage) {
    heroMedia.style.backgroundImage = `url("${heroImage}")`;
  }
}

function stringOrNull(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed || null;
}

function mountLeadForm(page: HTMLElement): void {
  const form = page.querySelector<HTMLFormElement>(".home-page__lead-form");
  if (!form) {
    return;
  }
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFormMessage(form);
    if (!form.reportValidity()) {
      return;
    }
    const data = new FormData(form);
    setFormBusy(form, true);
    try {
      await leadsService.submit({
        activityId: null,
        groupId: null,
        fullName: String(data.get("fullName") ?? "").trim(),
        phone: String(data.get("phone") ?? "").trim(),
        email: stringOrNull(data.get("email")),
        message: stringOrNull(data.get("message")),
        sourcePath: window.location.pathname
      });
      form.reset();
      setFormMessage(form, "הפנייה נשלחה בהצלחה. נחזור אליך בהקדם.");
    } catch {
      setFormMessage(form, "שליחת הפנייה נכשלה. נסו שוב בעוד רגע.");
    } finally {
      setFormBusy(form, false);
    }
  });
}

export async function mountHomePage(root: HTMLElement): Promise<void> {
  const page = root.querySelector<HTMLElement>(".home-page");
  if (!page) {
    throw new Error("מבנה עמוד הבית אינו תקין.");
  }

  const activitiesContainer = page.querySelector<HTMLElement>(".home-page__activity-list");
  if (!activitiesContainer) {
    throw new Error("רשימת הפעילויות בעמוד הבית אינה תקינה.");
  }

  mountLeadForm(page);

  try {
    const [settings, activities] = await Promise.all([
      settingsService.getPublic(),
      activitiesService.listPublic()
    ]);
    renderSettings(page, settings);
    renderActivities(activitiesContainer, activities);
  } catch {
    activitiesContainer.innerHTML =
      '<p class="empty-state" role="alert">לא ניתן לטעון את נתוני האתר כרגע.</p>';
  }
}
