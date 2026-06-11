import { ROUTES } from "./config.js";
import { getState, setState } from "./state.js";
import { authService } from "../services/auth-service.js";
import { mountActivitiesPage } from "../pages/activities/script.js";
import { mountHomePage } from "../pages/home/script.js";
import { mountLoginPage } from "../pages/login/script.js";
import { mountChangePasswordPage } from "../pages/change-password/script.js";
import { mountAdminGeneralPage } from "../pages/admin-general/script.js";
import { mountAdminActivitiesPage } from "../pages/admin-activities/script.js";
import { mountAdminUsersPage } from "../pages/admin-users/script.js";
import { mountAdminLeadsPage } from "../pages/admin-leads/script.js";
import { mountAdminMediaPage } from "../pages/admin-media/script.js";

type PageMount = (root: HTMLElement) => void | Promise<void>;

interface RouteDefinition {
  template: string;
  mount: PageMount;
  protected: boolean;
}

const routes: Record<string, RouteDefinition> = {
  [ROUTES.home]: {
    template: "/pages/home/index.html",
    mount: mountHomePage,
    protected: false
  },
  [ROUTES.activities]: {
    template: "/pages/activities/index.html",
    mount: mountActivitiesPage,
    protected: false
  },
  [ROUTES.login]: {
    template: "/pages/login/index.html",
    mount: mountLoginPage,
    protected: false
  },
  [ROUTES.changePassword]: {
    template: "/pages/change-password/index.html",
    mount: mountChangePasswordPage,
    protected: true
  },
  [ROUTES.adminGeneral]: {
    template: "/pages/admin-general/index.html",
    mount: mountAdminGeneralPage,
    protected: true
  },
  [ROUTES.adminActivities]: {
    template: "/pages/admin-activities/index.html",
    mount: mountAdminActivitiesPage,
    protected: true
  },
  [ROUTES.adminUsers]: {
    template: "/pages/admin-users/index.html",
    mount: mountAdminUsersPage,
    protected: true
  },
  [ROUTES.adminLeads]: {
    template: "/pages/admin-leads/index.html",
    mount: mountAdminLeadsPage,
    protected: true
  },
  [ROUTES.adminMedia]: {
    template: "/pages/admin-media/index.html",
    mount: mountAdminMediaPage,
    protected: true
  }
};

let navigationVersion = 0;

function getAppRoot(): HTMLElement {
  const root = document.querySelector<HTMLElement>("#app");
  if (!root) {
    throw new Error("לא נמצא אזור התוכן הראשי.");
  }
  return root;
}

function setDocumentTitle(path: string): void {
  const titles: Record<string, string> = {
    [ROUTES.home]: "בית",
    [ROUTES.activities]: "פעילויות",
    [ROUTES.login]: "התחברות",
    [ROUTES.changePassword]: "החלפת סיסמה",
    [ROUTES.adminGeneral]: "הגדרות כלליות",
    [ROUTES.adminActivities]: "ניהול פעילויות",
    [ROUTES.adminUsers]: "ניהול משתמשים",
    [ROUTES.adminLeads]: "פניות מהאתר",
    [ROUTES.adminMedia]: "ניהול מדיה"
  };
  document.title = `${titles[path] ?? "מערכת ניהול"} | מערכת ניהול`;
}

async function ensureSession(): Promise<boolean> {
  if (getState().user) {
    return true;
  }

  try {
    const user = await authService.getCurrentUser();
    setState({ user });
    return true;
  } catch {
    setState({ user: null });
    return false;
  }
}

async function renderRoute(): Promise<void> {
  const version = ++navigationVersion;
  const root = getAppRoot();
  const path = window.location.pathname;
  const route = routes[path];

  if (!route) {
    navigate(getState().user ? ROUTES.adminGeneral : ROUTES.home, true);
    return;
  }

  if (route.protected && !(await ensureSession())) {
    navigate(ROUTES.login, true);
    return;
  }

  if (path === ROUTES.login && !getState().user) {
    await ensureSession();
  }

  const user = getState().user;
  if (path === ROUTES.login && user) {
    navigate(ROUTES.adminGeneral, true);
    return;
  }

  root.setAttribute("aria-busy", "true");
  try {
    const response = await fetch(route.template, { credentials: "same-origin" });
    if (!response.ok) {
      throw new Error("טעינת העמוד נכשלה.");
    }
    const html = await response.text();
    if (version !== navigationVersion) {
      return;
    }
    root.innerHTML = html;
    setDocumentTitle(path);
    await route.mount(root);
    root.focus({ preventScroll: true });
  } catch {
    root.innerHTML = `
      <section class="system-message" role="alert">
        <h1>לא ניתן לטעון את העמוד</h1>
        <p>נסו לרענן את הדף או לחזור מאוחר יותר.</p>
      </section>
    `;
  } finally {
    root.removeAttribute("aria-busy");
  }
}

export function navigate(path: string, replace = false): void {
  if (window.location.pathname === path) {
    void renderRoute();
    return;
  }
  window.history[replace ? "replaceState" : "pushState"]({}, "", path);
  void renderRoute();
}

export function startRouter(): void {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    const link = target.closest<HTMLAnchorElement>("a[data-link]");
    if (!link || link.origin !== window.location.origin) {
      return;
    }
    event.preventDefault();
    navigate(link.pathname);
  });
  window.addEventListener("popstate", () => void renderRoute());
  void renderRoute();
}
