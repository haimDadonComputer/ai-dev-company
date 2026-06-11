import { mountAdminLayout } from "../../app/admin-layout.js";
import { setFormBusy, setFormMessage } from "../../components/form/script.js";
import { notify } from "../../components/notification/script.js";
import { adminActivitiesService } from "../../services/admin-activities-service.js";
import type {
  ActivityStatus,
  AdminActivity,
  AdminActivityInput,
  AdminActivityWithGroups,
  AdminGroup,
  AdminGroupInput,
  GroupRegistrationStatus
} from "../../types/app.js";

const activityStatusLabels: Record<ActivityStatus, string> = {
  active: "פעיל",
  inactive: "לא פעיל",
  archived: "בארכיון"
};

const registrationLabels: Record<GroupRegistrationStatus, string> = {
  open: "פתוחה",
  closed: "סגורה",
  full: "מלאה",
  archived: "בארכיון"
};

function getInput(form: HTMLFormElement, name: string): HTMLInputElement {
  const field = form.elements.namedItem(name);
  if (!(field instanceof HTMLInputElement)) {
    throw new Error(`Missing input ${name}`);
  }
  return field;
}

function getSelect(form: HTMLFormElement, name: string): HTMLSelectElement {
  const field = form.elements.namedItem(name);
  if (!(field instanceof HTMLSelectElement)) {
    throw new Error(`Missing select ${name}`);
  }
  return field;
}

function getTextarea(form: HTMLFormElement, name: string): HTMLTextAreaElement {
  const field = form.elements.namedItem(name);
  if (!(field instanceof HTMLTextAreaElement)) {
    throw new Error(`Missing textarea ${name}`);
  }
  return field;
}

function getCheckbox(form: HTMLFormElement, name: string): HTMLInputElement {
  const field = form.elements.namedItem(name);
  if (!(field instanceof HTMLInputElement)) {
    throw new Error(`Missing checkbox ${name}`);
  }
  return field;
}

function nullIfEmpty(value: string): string | null {
  const trimmed = value.trim();
  return trimmed || null;
}

function numberOrNull(value: string): number | null {
  const trimmed = value.trim();
  return trimmed ? Number(trimmed) : null;
}

function renderActivities(
  container: HTMLElement,
  activities: AdminActivityWithGroups[],
  selectedId: number | null,
  onSelect: (item: AdminActivityWithGroups) => void
): void {
  container.replaceChildren();
  if (activities.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "אין פעילויות להצגה.";
    container.append(empty);
    return;
  }
  activities.forEach((item) => {
    const article = document.createElement("article");
    article.className = "admin-activities-page__item";
    if (selectedId === item.activity.id) {
      article.classList.add("admin-activities-page__item--selected");
    }
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.activity.name;
    button.addEventListener("click", () => onSelect(item));
    const meta = document.createElement("p");
    meta.textContent = [
      activityStatusLabels[item.activity.status],
      item.activity.publishOnSite ? "מפורסם" : "לא מפורסם",
      `${item.groups.length} קבוצות`
    ].join(" | ");
    article.append(button, meta);
    container.append(article);
  });
}

function renderGroups(
  container: HTMLElement,
  groups: AdminGroup[],
  selectedId: number | null,
  onSelect: (group: AdminGroup) => void
): void {
  container.replaceChildren();
  if (groups.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "אין קבוצות לפעילות זו.";
    container.append(empty);
    return;
  }
  groups.forEach((group) => {
    const article = document.createElement("article");
    article.className = "admin-activities-page__group";
    if (selectedId === group.id) {
      article.classList.add("admin-activities-page__group--selected");
    }
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = group.name;
    button.addEventListener("click", () => onSelect(group));
    const meta = document.createElement("p");
    meta.textContent = [
      activityStatusLabels[group.status],
      registrationLabels[group.registrationStatus],
      group.publishOnSite ? "מפורסמת" : "לא מפורסמת"
    ].join(" | ");
    article.append(button, meta);
    container.append(article);
  });
}

function fillActivityForm(form: HTMLFormElement, activity: AdminActivity | null): void {
  form.reset();
  getInput(form, "name").value = activity?.name ?? "";
  getInput(form, "activityType").value = activity?.activityType ?? "";
  getInput(form, "audience").value = activity?.audience ?? "";
  getInput(form, "priceAmount").value = activity?.priceAmount ?? "";
  getSelect(form, "status").value = activity?.status ?? "active";
  getCheckbox(form, "publishOnSite").checked = activity?.publishOnSite ?? false;
  getTextarea(form, "summary").value = activity?.summary ?? "";
  getTextarea(form, "description").value = activity?.description ?? "";
}

function fillGroupForm(form: HTMLFormElement, group: AdminGroup | null): void {
  form.reset();
  getInput(form, "name").value = group?.name ?? "";
  getInput(form, "startDate").value = group?.startDate?.slice(0, 10) ?? "";
  getInput(form, "endDate").value = group?.endDate?.slice(0, 10) ?? "";
  getInput(form, "capacity").value = group?.capacity ? String(group.capacity) : "";
  getSelect(form, "registrationStatus").value = group?.registrationStatus ?? "open";
  getSelect(form, "status").value = group?.status ?? "active";
  getCheckbox(form, "publishOnSite").checked = group?.publishOnSite ?? false;
  getTextarea(form, "scheduleText").value = group?.scheduleText ?? "";
  getTextarea(form, "description").value = group?.description ?? "";
}

function buildActivityInput(form: HTMLFormElement): AdminActivityInput {
  return {
    name: getInput(form, "name").value.trim(),
    activityType: getInput(form, "activityType").value.trim(),
    audience: getInput(form, "audience").value.trim(),
    summary: getTextarea(form, "summary").value.trim(),
    description: nullIfEmpty(getTextarea(form, "description").value),
    imageMediaAssetId: null,
    priceAmount: nullIfEmpty(getInput(form, "priceAmount").value),
    publishOnSite: getCheckbox(form, "publishOnSite").checked,
    status: getSelect(form, "status").value as ActivityStatus
  };
}

function buildGroupInput(
  form: HTMLFormElement,
  activityId: number
): AdminGroupInput {
  return {
    activityId,
    name: getInput(form, "name").value.trim(),
    description: nullIfEmpty(getTextarea(form, "description").value),
    startDate: nullIfEmpty(getInput(form, "startDate").value),
    endDate: nullIfEmpty(getInput(form, "endDate").value),
    scheduleText: getTextarea(form, "scheduleText").value.trim(),
    capacity: numberOrNull(getInput(form, "capacity").value),
    registrationStatus: getSelect(form, "registrationStatus").value as GroupRegistrationStatus,
    publishOnSite: getCheckbox(form, "publishOnSite").checked,
    status: getSelect(form, "status").value as ActivityStatus,
    instructorUserId: null
  };
}

export async function mountAdminActivitiesPage(root: HTMLElement): Promise<void> {
  const page = root.querySelector<HTMLElement>(".admin-activities-page");
  if (!page) {
    throw new Error("מבנה עמוד הפעילויות אינו תקין.");
  }
  mountAdminLayout(root, page);

  const list = page.querySelector<HTMLElement>(".admin-activities-page__items");
  const groupsList = page.querySelector<HTMLElement>(".admin-activities-page__groups-list");
  const activityForm = page.querySelector<HTMLFormElement>(".admin-activities-page__activity-form");
  const groupForm = page.querySelector<HTMLFormElement>(".admin-activities-page__group-form");
  const activityTitle = page.querySelector<HTMLElement>("#activity-form-title");
  const groupTitle = page.querySelector<HTMLElement>("#group-form-title");
  const newActivityButton = page.querySelector<HTMLButtonElement>(".admin-activities-page__new-activity");
  const newGroupButton = page.querySelector<HTMLButtonElement>(".admin-activities-page__new-group");

  if (!list || !groupsList || !activityForm || !groupForm || !activityTitle || !groupTitle || !newActivityButton || !newGroupButton) {
    throw new Error("שדות עמוד הפעילויות אינם תקינים.");
  }

  let activities: AdminActivityWithGroups[] = [];
  let selectedActivity: AdminActivityWithGroups | null = null;
  let selectedGroup: AdminGroup | null = null;

  const selectGroup = (group: AdminGroup | null): void => {
    selectedGroup = group;
    groupTitle.textContent = group ? `עריכת ${group.name}` : "קבוצה חדשה";
    fillGroupForm(groupForm, group);
    renderGroups(groupsList, selectedActivity?.groups ?? [], selectedGroup?.id ?? null, selectGroup);
  };

  const selectActivity = (item: AdminActivityWithGroups | null): void => {
    selectedActivity = item;
    selectedGroup = null;
    activityTitle.textContent = item ? `עריכת ${item.activity.name}` : "פעילות חדשה";
    fillActivityForm(activityForm, item?.activity ?? null);
    renderActivities(list, activities, item?.activity.id ?? null, selectActivity);
    renderGroups(groupsList, item?.groups ?? [], null, selectGroup);
    fillGroupForm(groupForm, null);
    groupForm.toggleAttribute("hidden", !item);
    newGroupButton.disabled = !item;
  };

  const loadActivities = async (): Promise<void> => {
    list.setAttribute("aria-busy", "true");
    try {
      activities = await adminActivitiesService.list();
      if (selectedActivity) {
        selectedActivity =
          activities.find((item) => item.activity.id === selectedActivity?.activity.id) ?? null;
      }
      renderActivities(list, activities, selectedActivity?.activity.id ?? null, selectActivity);
      if (selectedActivity) {
        selectActivity(selectedActivity);
      } else {
        selectActivity(null);
      }
    } catch {
      list.innerHTML = '<p class="empty-state" role="alert">לא ניתן לטעון פעילויות.</p>';
    } finally {
      list.removeAttribute("aria-busy");
    }
  };

  newActivityButton.addEventListener("click", () => selectActivity(null));
  newGroupButton.addEventListener("click", () => selectGroup(null));

  activityForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFormMessage(activityForm);
    if (!activityForm.reportValidity()) {
      return;
    }
    setFormBusy(activityForm, true);
    try {
      const input = buildActivityInput(activityForm);
      const saved = selectedActivity
        ? await adminActivitiesService.updateActivity(selectedActivity.activity.id, input)
        : await adminActivitiesService.createActivity(input);
      notify("הפעילות נשמרה בהצלחה.", "success");
      selectedActivity = { activity: saved, groups: selectedActivity?.groups ?? [] };
      await loadActivities();
    } catch {
      setFormMessage(activityForm, "שמירת הפעילות נכשלה.");
    } finally {
      setFormBusy(activityForm, false);
    }
  });

  groupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFormMessage(groupForm);
    if (!selectedActivity || !groupForm.reportValidity()) {
      return;
    }
    setFormBusy(groupForm, true);
    try {
      const input = buildGroupInput(groupForm, selectedActivity.activity.id);
      await (selectedGroup
        ? adminActivitiesService.updateGroup(selectedGroup.id, input)
        : adminActivitiesService.createGroup(input));
      notify("הקבוצה נשמרה בהצלחה.", "success");
      await loadActivities();
    } catch {
      setFormMessage(groupForm, "שמירת הקבוצה נכשלה.");
    } finally {
      setFormBusy(groupForm, false);
    }
  });

  groupForm.hidden = true;
  newGroupButton.disabled = true;
  await loadActivities();
}
