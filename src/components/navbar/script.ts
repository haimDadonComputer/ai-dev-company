import { ROUTES } from "../../app/config.js";
import { navigate } from "../../app/router.js";
import { getState, setState } from "../../app/state.js";
import { authService } from "../../services/auth-service.js";
import { notify } from "../notification/script.js";

export function createNavbar(): HTMLElement {
  const header = document.createElement("header");
  header.className = "navbar-component";

  const brand = document.createElement("a");
  brand.className = "navbar-component__brand";
  brand.href = ROUTES.adminGeneral;
  brand.dataset.link = "";
  brand.textContent = "מערכת ניהול";

  const actions = document.createElement("div");
  actions.className = "navbar-component__actions";

  const user = document.createElement("span");
  user.className = "navbar-component__user";
  user.textContent = getState().user?.username ?? "";

  const logout = document.createElement("button");
  logout.className = "button-component button-component--secondary navbar-component__logout";
  logout.type = "button";
  logout.textContent = "התנתקות";
  logout.addEventListener("click", async () => {
    logout.disabled = true;
    try {
      await authService.logout();
      setState({ user: null });
      navigate(ROUTES.login, true);
    } catch {
      logout.disabled = false;
      notify("לא ניתן להתנתק כרגע.", "error");
    }
  });

  actions.append(user, logout);
  header.append(brand, actions);
  return header;
}
