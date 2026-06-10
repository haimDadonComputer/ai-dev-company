import { mountAdminLayout } from "../../app/admin-layout.js";
import { leadsService } from "../../services/leads-service.js";
import type { PublicLead, PublicLeadStatus } from "../../types/app.js";

const statusLabels: Record<PublicLeadStatus, string> = {
  new: "חדש",
  contacted: "נוצר קשר",
  closed: "נסגר",
  archived: "בארכיון"
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function createRow(
  lead: PublicLead,
  selected: PublicLead | null,
  onSelect: (lead: PublicLead) => void
): HTMLTableRowElement {
  const row = document.createElement("tr");
  if (selected?.id === lead.id) {
    row.className = "admin-leads-page__row--selected";
  }

  const personCell = document.createElement("td");
  personCell.dataset.label = "פונה";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "admin-leads-page__select";
  button.textContent = lead.fullName;
  button.addEventListener("click", () => onSelect(lead));
  const phone = document.createElement("span");
  phone.textContent = lead.phone;
  personCell.append(button, phone);

  const activityCell = document.createElement("td");
  activityCell.dataset.label = "פעילות";
  activityCell.textContent = [lead.activityName, lead.groupName].filter(Boolean).join(" | ") || "-";

  const statusCell = document.createElement("td");
  statusCell.dataset.label = "סטטוס";
  statusCell.textContent = statusLabels[lead.status];

  const dateCell = document.createElement("td");
  dateCell.dataset.label = "נשלח";
  dateCell.textContent = formatDate(lead.createdAt);

  row.append(personCell, activityCell, statusCell, dateCell);
  return row;
}

function renderRows(
  container: HTMLElement,
  count: HTMLElement,
  leads: PublicLead[],
  selected: PublicLead | null,
  onSelect: (lead: PublicLead) => void
): void {
  container.replaceChildren();
  count.textContent = `${leads.length} פניות`;
  if (leads.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.className = "empty-state";
    cell.textContent = "לא נמצאו פניות להצגה.";
    row.append(cell);
    container.append(row);
    return;
  }
  leads.forEach((lead) => container.append(createRow(lead, selected, onSelect)));
}

function renderDetails(container: HTMLElement, lead: PublicLead | null): void {
  container.replaceChildren();
  if (!lead) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "בחרו פנייה כדי לראות פרטים מלאים.";
    container.append(empty);
    return;
  }

  const list = document.createElement("dl");
  list.className = "admin-leads-page__details-list";
  const items: Array<[string, string]> = [
    ["שם", lead.fullName],
    ["טלפון", lead.phone],
    ["אימייל", lead.email || "-"],
    ["פעילות", [lead.activityName, lead.groupName].filter(Boolean).join(" | ") || "-"],
    ["סטטוס", statusLabels[lead.status]],
    ["מקור", lead.sourcePath || "-"],
    ["נשלח", formatDate(lead.createdAt)],
    ["הודעה", lead.message || "-"]
  ];
  items.forEach(([label, value]) => {
    const wrapper = document.createElement("div");
    const term = document.createElement("dt");
    term.textContent = label;
    const description = document.createElement("dd");
    description.textContent = value;
    wrapper.append(term, description);
    list.append(wrapper);
  });
  container.append(list);
}

export async function mountAdminLeadsPage(root: HTMLElement): Promise<void> {
  const page = root.querySelector<HTMLElement>(".admin-leads-page");
  if (!page) {
    throw new Error("מבנה עמוד הפניות אינו תקין.");
  }
  mountAdminLayout(root, page);

  const statusFilter = page.querySelector<HTMLSelectElement>("#leads-status-filter");
  const refreshButton = page.querySelector<HTMLButtonElement>(".admin-leads-page__refresh");
  const rows = page.querySelector<HTMLElement>(".admin-leads-page__rows");
  const count = page.querySelector<HTMLElement>(".admin-leads-page__count");
  const details = page.querySelector<HTMLElement>(".admin-leads-page__selected");
  if (!statusFilter || !refreshButton || !rows || !count || !details) {
    throw new Error("שדות עמוד הפניות אינם תקינים.");
  }

  let leads: PublicLead[] = [];
  let selectedLead: PublicLead | null = null;

  const selectLead = (lead: PublicLead): void => {
    selectedLead = lead;
    renderRows(rows, count, leads, selectedLead, selectLead);
    renderDetails(details, selectedLead);
  };

  const loadLeads = async (): Promise<void> => {
    rows.setAttribute("aria-busy", "true");
    try {
      leads = await leadsService.list({
        status: statusFilter.value ? (statusFilter.value as PublicLeadStatus) : undefined
      });
      if (selectedLead && !leads.some((lead) => lead.id === selectedLead?.id)) {
        selectedLead = null;
      }
      renderRows(rows, count, leads, selectedLead, selectLead);
      renderDetails(details, selectedLead);
    } catch {
      rows.innerHTML =
        '<tr><td colspan="4" class="empty-state" role="alert">לא ניתן לטעון את רשימת הפניות.</td></tr>';
    } finally {
      rows.removeAttribute("aria-busy");
    }
  };

  statusFilter.addEventListener("change", () => void loadLeads());
  refreshButton.addEventListener("click", () => void loadLeads());

  await loadLeads();
}
