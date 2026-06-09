import { ROUTES } from "../../app/config.js";

const links = [
  { href: ROUTES.adminGeneral, label: "כללי" },
  { href: ROUTES.adminUsers, label: "משתמשים" },
  { href: ROUTES.adminMedia, label: "מדיה" }
];

export function createSidebar(): HTMLElement {
  const nav = document.createElement("nav");
  nav.className = "sidebar-component";
  nav.setAttribute("aria-label", "ניווט ניהול");

  links.forEach(({ href, label }) => {
    const link = document.createElement("a");
    link.href = href;
    link.dataset.link = "";
    link.textContent = label;
    link.title = label;
    if (window.location.pathname === href) {
      link.classList.add("sidebar-component__link--active");
      link.setAttribute("aria-current", "page");
    }
    nav.append(link);
  });
  return nav;
}
