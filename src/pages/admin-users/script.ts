import { mountAdminLayout } from "../../app/admin-layout.js";
import { setFormBusy, setFormMessage } from "../../components/form/script.js";
import { notify } from "../../components/notification/script.js";
import { usersService } from "../../services/users-service.js";
import type {
  CreateManagedUserInput,
  InstructorProfile,
  ManagedUser,
  ManagedUserProfile,
  StudentProfile,
  UpdateManagedUserInput,
  UserRole,
  UserStatus
} from "../../types/app.js";

const roleLabels: Record<UserRole, string> = {
  student: "תלמיד",
  instructor: "מדריך",
  admin: "מנהל"
};

const statusLabels: Record<UserStatus, string> = {
  active: "פעיל",
  inactive: "לא פעיל",
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

function nullIfEmpty(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function setInputValue(
  form: HTMLFormElement,
  name: string,
  value: string | null | undefined
): void {
  const field = form.elements.namedItem(name);
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    field.value = value ?? "";
  }
}

function profileRole(form: HTMLFormElement, selectedUser: ManagedUser | null): UserRole {
  return selectedUser?.role ?? (getSelect(form, "role").value as UserRole);
}

function setCreateMode(form: HTMLFormElement, isCreate: boolean): void {
  form.querySelectorAll<HTMLElement>(".admin-users-page__create-only").forEach((item) => {
    item.hidden = !isCreate;
  });
  ["username", "password", "role"].forEach((name) => {
    const field = form.elements.namedItem(name);
    if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) {
      field.disabled = !isCreate;
      field.required = isCreate;
    }
  });
}

function syncProfileSections(form: HTMLFormElement, selectedUser: ManagedUser | null): void {
  const role = profileRole(form, selectedUser);
  const student = form.querySelector<HTMLFieldSetElement>(".admin-users-page__student");
  const instructor = form.querySelector<HTMLFieldSetElement>(".admin-users-page__instructor");
  if (!student || !instructor) {
    throw new Error("Missing profile sections");
  }
  student.hidden = role !== "student";
  instructor.hidden = role !== "instructor";
}

function buildStudent(form: HTMLFormElement): StudentProfile {
  return {
    nationalId: nullIfEmpty(getInput(form, "nationalId").value),
    birthDate: nullIfEmpty(getInput(form, "birthDate").value),
    fullAddress: getTextarea(form, "fullAddress").value.trim()
  };
}

function buildInstructor(form: HTMLFormElement): InstructorProfile {
  return {
    expertiseAreas: nullIfEmpty(getTextarea(form, "expertiseAreas").value),
    biography: nullIfEmpty(getTextarea(form, "biography").value),
    resumeFileId: null,
    certificationFileIds: null,
    notes: nullIfEmpty(getTextarea(form, "instructorNotes").value)
  };
}

function buildCreateInput(form: HTMLFormElement): CreateManagedUserInput {
  const role = getSelect(form, "role").value as UserRole;
  const input: CreateManagedUserInput = {
    username: getInput(form, "username").value.trim(),
    password: getInput(form, "password").value,
    role,
    firstName: getInput(form, "firstName").value.trim(),
    lastName: getInput(form, "lastName").value.trim(),
    phone: getInput(form, "phone").value.trim(),
    email: getInput(form, "email").value.trim(),
    notes: nullIfEmpty(getTextarea(form, "notes").value)
  };
  if (role === "student") {
    input.student = buildStudent(form);
  }
  if (role === "instructor") {
    input.instructor = buildInstructor(form);
  }
  return input;
}

function buildUpdateInput(
  form: HTMLFormElement,
  selectedUser: ManagedUser
): UpdateManagedUserInput {
  const input: UpdateManagedUserInput = {
    firstName: getInput(form, "firstName").value.trim(),
    lastName: getInput(form, "lastName").value.trim(),
    phone: getInput(form, "phone").value.trim(),
    email: getInput(form, "email").value.trim(),
    notes: nullIfEmpty(getTextarea(form, "notes").value)
  };
  if (selectedUser.role === "student") {
    input.student = buildStudent(form);
  }
  if (selectedUser.role === "instructor") {
    input.instructor = buildInstructor(form);
  }
  return input;
}

function clearForm(form: HTMLFormElement): void {
  form.reset();
  getSelect(form, "role").value = "student";
  setInputValue(form, "notes", "");
  setInputValue(form, "fullAddress", "");
  setInputValue(form, "expertiseAreas", "");
  setInputValue(form, "biography", "");
  setInputValue(form, "instructorNotes", "");
}

function fillForm(form: HTMLFormElement, profile: ManagedUserProfile): void {
  const { user, student, instructor } = profile;
  setInputValue(form, "firstName", user.firstName);
  setInputValue(form, "lastName", user.lastName);
  setInputValue(form, "phone", user.phone);
  setInputValue(form, "email", user.email);
  setInputValue(form, "notes", user.notes);
  setInputValue(form, "nationalId", student?.nationalId);
  setInputValue(form, "birthDate", student?.birthDate);
  setInputValue(form, "fullAddress", student?.fullAddress);
  setInputValue(form, "expertiseAreas", instructor?.expertiseAreas);
  setInputValue(form, "biography", instructor?.biography);
  setInputValue(form, "instructorNotes", instructor?.notes);
}

function createRow(
  user: ManagedUser,
  selectedUser: ManagedUser | null,
  onSelect: (user: ManagedUser) => void
): HTMLTableRowElement {
  const row = document.createElement("tr");
  if (selectedUser?.id === user.id) {
    row.className = "admin-users-page__row--selected";
  }

  const nameCell = document.createElement("td");
  nameCell.dataset.label = "משתמש";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "admin-users-page__select";
  button.textContent = user.username;
  button.addEventListener("click", () => onSelect(user));
  const fullName = document.createElement("span");
  fullName.textContent = `${user.firstName} ${user.lastName}`.trim();
  nameCell.append(button, fullName);

  const roleCell = document.createElement("td");
  roleCell.dataset.label = "תפקיד";
  roleCell.textContent = roleLabels[user.role];

  const detailsCell = document.createElement("td");
  detailsCell.dataset.label = "פרטים";
  detailsCell.textContent = [user.phone, user.email].filter(Boolean).join(" | ") || "-";

  const statusCell = document.createElement("td");
  statusCell.dataset.label = "סטטוס";
  statusCell.textContent = statusLabels[user.status];

  const passwordCell = document.createElement("td");
  passwordCell.dataset.label = "סיסמה";
  passwordCell.textContent = user.mustChangePassword ? "נדרשת החלפה" : "תקינה";

  row.append(nameCell, roleCell, detailsCell, statusCell, passwordCell);
  return row;
}

function renderRows(
  container: HTMLElement,
  count: HTMLElement,
  users: ManagedUser[],
  selectedUser: ManagedUser | null,
  onSelect: (user: ManagedUser) => void
): void {
  container.replaceChildren();
  count.textContent = `${users.length} משתמשים`;
  if (users.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.className = "empty-state";
    cell.textContent = "לא נמצאו משתמשים להצגה.";
    row.append(cell);
    container.append(row);
    return;
  }
  users.forEach((user) => container.append(createRow(user, selectedUser, onSelect)));
}

export async function mountAdminUsersPage(root: HTMLElement): Promise<void> {
  const page = root.querySelector<HTMLElement>(".admin-users-page");
  if (!page) {
    throw new Error("מבנה עמוד המשתמשים אינו תקין.");
  }
  mountAdminLayout(root, page);

  const roleFilter = page.querySelector<HTMLSelectElement>("#users-role-filter");
  const statusFilter = page.querySelector<HTMLSelectElement>("#users-status-filter");
  const refreshButton = page.querySelector<HTMLButtonElement>(".admin-users-page__refresh");
  const rows = page.querySelector<HTMLElement>(".admin-users-page__rows");
  const count = page.querySelector<HTMLElement>(".admin-users-page__count");
  const title = page.querySelector<HTMLElement>("#user-form-title");
  const newButton = page.querySelector<HTMLButtonElement>(".admin-users-page__new");
  const userForm = page.querySelector<HTMLFormElement>(".admin-users-page__form");
  const passwordForm = page.querySelector<HTMLFormElement>(".admin-users-page__password");
  const statusForm = page.querySelector<HTMLFormElement>(".admin-users-page__status");

  if (
    !roleFilter ||
    !statusFilter ||
    !refreshButton ||
    !rows ||
    !count ||
    !title ||
    !newButton ||
    !userForm ||
    !passwordForm ||
    !statusForm
  ) {
    throw new Error("שדות עמוד המשתמשים אינם תקינים.");
  }

  const roleFilterElement = roleFilter;
  const statusFilterElement = statusFilter;
  const refreshButtonElement = refreshButton;
  const rowsElement = rows;
  const countElement = count;
  const titleElement = title;
  const newButtonElement = newButton;
  const userFormElement = userForm;
  const passwordFormElement = passwordForm;
  const statusFormElement = statusForm;

  let users: ManagedUser[] = [];
  let selectedUser: ManagedUser | null = null;

  const loadUsers = async (): Promise<void> => {
    rowsElement.setAttribute("aria-busy", "true");
    try {
      users = await usersService.list({
        role: roleFilterElement.value ? (roleFilterElement.value as UserRole) : undefined,
        status: statusFilterElement.value
          ? (statusFilterElement.value as UserStatus)
          : undefined
      });
      renderRows(rowsElement, countElement, users, selectedUser, selectUser);
    } catch {
      rowsElement.innerHTML = '<tr><td colspan="5" class="empty-state" role="alert">לא ניתן לטעון את רשימת המשתמשים.</td></tr>';
    } finally {
      rowsElement.removeAttribute("aria-busy");
    }
  };

  const setNewUserMode = (): void => {
    selectedUser = null;
    titleElement.textContent = "משתמש חדש";
    clearForm(userFormElement);
    setCreateMode(userFormElement, true);
    passwordFormElement.hidden = true;
    statusFormElement.hidden = true;
    setFormMessage(userFormElement);
    setFormMessage(passwordFormElement);
    setFormMessage(statusFormElement);
    syncProfileSections(userFormElement, selectedUser);
    renderRows(rowsElement, countElement, users, selectedUser, selectUser);
  };

  async function selectUser(user: ManagedUser): Promise<void> {
    selectedUser = user;
    titleElement.textContent = `עריכת ${user.username}`;
    clearForm(userFormElement);
    setCreateMode(userFormElement, false);
    passwordFormElement.hidden = false;
    statusFormElement.hidden = false;
    getSelect(statusFormElement, "status").value = user.status;
    setFormMessage(userFormElement);
    setFormMessage(passwordFormElement);
    setFormMessage(statusFormElement);
    syncProfileSections(userFormElement, selectedUser);
    renderRows(rowsElement, countElement, users, selectedUser, selectUser);

    setFormBusy(userFormElement, true);
    try {
      fillForm(userFormElement, await usersService.get(user.id));
    } catch {
      setFormMessage(userFormElement, "לא ניתן לטעון את פרטי המשתמש.");
    } finally {
      setFormBusy(userFormElement, false);
      setCreateMode(userFormElement, false);
    }
  }

  getSelect(userFormElement, "role").addEventListener("change", () => {
    syncProfileSections(userFormElement, selectedUser);
  });
  roleFilterElement.addEventListener("change", () => void loadUsers());
  statusFilterElement.addEventListener("change", () => void loadUsers());
  refreshButtonElement.addEventListener("click", () => void loadUsers());
  newButtonElement.addEventListener("click", setNewUserMode);

  userFormElement.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFormMessage(userFormElement);
    if (!userFormElement.reportValidity()) {
      return;
    }

    setFormBusy(userFormElement, true);
    try {
      const profile = selectedUser
        ? await usersService.update(
            selectedUser.id,
            buildUpdateInput(userFormElement, selectedUser)
          )
        : await usersService.create(buildCreateInput(userFormElement));
      selectedUser = profile.user;
      notify("פרטי המשתמש נשמרו בהצלחה.", "success");
      await loadUsers();
      await selectUser(profile.user);
    } catch {
      setFormMessage(userFormElement, "שמירת המשתמש נכשלה.");
    } finally {
      setFormBusy(userFormElement, false);
      setCreateMode(userFormElement, selectedUser === null);
    }
  });

  passwordFormElement.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFormMessage(passwordFormElement);
    if (!selectedUser || !passwordFormElement.reportValidity()) {
      return;
    }

    setFormBusy(passwordFormElement, true);
    try {
      selectedUser = await usersService.resetPassword(
        selectedUser.id,
        getInput(passwordFormElement, "newPassword").value
      );
      passwordFormElement.reset();
      notify("הסיסמה אופסה והמשתמש יידרש להחליף אותה בכניסה הבאה.", "success");
      await loadUsers();
    } catch {
      setFormMessage(passwordFormElement, "איפוס הסיסמה נכשל.");
    } finally {
      setFormBusy(passwordFormElement, false);
    }
  });

  statusFormElement.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFormMessage(statusFormElement);
    if (!selectedUser || !statusFormElement.reportValidity()) {
      return;
    }

    setFormBusy(statusFormElement, true);
    try {
      selectedUser = await usersService.updateStatus(
        selectedUser.id,
        getSelect(statusFormElement, "status").value as UserStatus
      );
      notify("סטטוס המשתמש עודכן.", "success");
      await loadUsers();
    } catch {
      setFormMessage(statusFormElement, "עדכון הסטטוס נכשל.");
    } finally {
      setFormBusy(statusFormElement, false);
    }
  });

  setNewUserMode();
  await loadUsers();
}
