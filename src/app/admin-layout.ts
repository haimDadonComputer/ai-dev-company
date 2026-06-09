import { createNavbar } from "../components/navbar/script.js";
import { createSidebar } from "../components/sidebar/script.js";

export function mountAdminLayout(root: HTMLElement, content: HTMLElement): void {
  const layout = document.createElement("div");
  layout.className = "admin-layout";

  const body = document.createElement("div");
  body.className = "admin-layout__body";

  const main = document.createElement("div");
  main.className = "admin-layout__content";
  main.append(content);

  body.append(createSidebar(), main);
  layout.append(createNavbar(), body);
  root.replaceChildren(layout);
}
