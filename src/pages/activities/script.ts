import { activitiesService } from "../../services/activities-service.js";
import { setFormBusy, setFormMessage } from "../../components/form/script.js";
import { leadsService } from "../../services/leads-service.js";
import { settingsService } from "../../services/settings-service.js";
import type { PublicActivity, PublicGroup } from "../../types/app.js";

function formatDate(value: string | null): string {
  if (!value) {
    return "";
  }
  return new Intl.DateTimeFormat("he-IL").format(new Date(value));
}

function createActivityButton(
  activity: PublicActivity,
  selectedId: number | null,
  onSelect: (activity: PublicActivity) => void
): HTMLElement {
  const article = document.createElement("article");
  article.className = "activities-page__item";
  if (selectedId === activity.id) {
    article.classList.add("activities-page__item--selected");
  }

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = activity.name;
  button.addEventListener("click", () => onSelect(activity));

  const meta = document.createElement("p");
  meta.textContent = [activity.activityType, activity.audience].filter(Boolean).join(" | ");

  const summary = document.createElement("p");
  summary.textContent = activity.summary;

  article.append(button, meta, summary);
  return article;
}

function createGroupCard(group: PublicGroup): HTMLElement {
  const article = document.createElement("article");
  article.className = "activities-page__group";

  const title = document.createElement("h3");
  title.textContent = group.name;
  const schedule = document.createElement("p");
  schedule.textContent = group.scheduleText || "לוח זמנים יעודכן בהמשך";

  const dates = document.createElement("p");
  const dateText = [formatDate(group.startDate), formatDate(group.endDate)]
    .filter(Boolean)
    .join(" - ");
  dates.textContent = dateText || "תאריכים יעודכנו בהמשך";

  const instructor = document.createElement("p");
  instructor.textContent = group.instructorName
    ? `מדריך: ${group.instructorName}`
    : "מדריך ישובץ בהמשך";

  const status = document.createElement("span");
  status.className = "activities-page__status";
  status.textContent = group.registrationStatus === "open" ? "פתוח" : "סגור";

  article.append(title, schedule, dates, instructor, status);
  return article;
}

function renderActivityList(
  container: HTMLElement,
  activities: PublicActivity[],
  selectedId: number | null,
  onSelect: (activity: PublicActivity) => void
): void {
  container.replaceChildren();
  if (activities.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "אין כרגע פעילויות שמפורסמות באתר.";
    container.append(empty);
    return;
  }
  activities.forEach((activity) => {
    container.append(createActivityButton(activity, selectedId, onSelect));
  });
}

function renderDetails(
  container: HTMLElement,
  activity: PublicActivity,
  groups: PublicGroup[]
): void {
  container.replaceChildren();
  const header = document.createElement("div");
  header.className = "activities-page__activity-header";
  const title = document.createElement("h3");
  title.textContent = activity.name;
  const summary = document.createElement("p");
  summary.textContent = activity.description || activity.summary;
  header.append(title, summary);
  container.append(header);

  if (groups.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "אין כרגע קבוצות פתוחות להצגה בפעילות זו.";
    container.append(empty);
    return;
  }
  groups.forEach((group) => container.append(createGroupCard(group)));
}

function stringOrNull(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed || null;
}

export async function mountActivitiesPage(root: HTMLElement): Promise<void> {
  const page = root.querySelector<HTMLElement>(".activities-page");
  if (!page) {
    throw new Error("מבנה עמוד הפעילויות אינו תקין.");
  }

  const brand = page.querySelector<HTMLElement>(".activities-page__brand");
  const list = page.querySelector<HTMLElement>(".activities-page__items");
  const details = page.querySelector<HTMLElement>(".activities-page__selected");
  const leadForm = page.querySelector<HTMLFormElement>(".activities-page__lead-form");
  if (!list || !details) {
    throw new Error("רשימת הפעילויות אינה תקינה.");
  }

  let activities: PublicActivity[] = [];
  let selectedId: number | null = null;

  leadForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFormMessage(leadForm);
    if (!leadForm.reportValidity()) {
      return;
    }
    const data = new FormData(leadForm);
    setFormBusy(leadForm, true);
    try {
      await leadsService.submit({
        activityId: selectedId,
        groupId: null,
        fullName: String(data.get("fullName") ?? "").trim(),
        phone: String(data.get("phone") ?? "").trim(),
        email: stringOrNull(data.get("email")),
        message: stringOrNull(data.get("message")),
        sourcePath: `${window.location.pathname}${window.location.search}`
      });
      leadForm.reset();
      setFormMessage(leadForm, "הפנייה נשלחה בהצלחה. נחזור אליך בהקדם.");
    } catch {
      setFormMessage(leadForm, "שליחת הפנייה נכשלה. נסו שוב בעוד רגע.");
    } finally {
      setFormBusy(leadForm, false);
    }
  });

  const selectActivity = async (activity: PublicActivity): Promise<void> => {
    selectedId = activity.id;
    renderActivityList(list, activities, selectedId, (item) => void selectActivity(item));
    details.innerHTML = '<p class="empty-state">טוען קבוצות...</p>';
    try {
      const result = await activitiesService.getPublicActivity(activity.id);
      renderDetails(details, result.activity, result.groups);
      window.history.replaceState({}, "", `/activities?activity=${activity.id}`);
    } catch {
      details.innerHTML =
        '<p class="empty-state" role="alert">לא ניתן לטעון את הקבוצות כרגע.</p>';
    }
  };

  try {
    const [settings, loadedActivities] = await Promise.all([
      settingsService.getPublic(),
      activitiesService.listPublic()
    ]);
    if (brand) {
      brand.textContent = settings.siteName || "המרכז הדיגיטלי";
    }
    activities = loadedActivities;
    const requestedId = Number(new URLSearchParams(window.location.search).get("activity"));
    const initial =
      activities.find((activity) => activity.id === requestedId) ?? activities[0] ?? null;
    renderActivityList(list, activities, initial?.id ?? null, (item) => void selectActivity(item));
    if (initial) {
      await selectActivity(initial);
    }
  } catch {
    list.innerHTML =
      '<p class="empty-state" role="alert">לא ניתן לטעון את הפעילויות כרגע.</p>';
  }
}
