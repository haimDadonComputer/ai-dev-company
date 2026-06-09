import { createButton } from "../button/script.js";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function confirmModal(options: ConfirmOptions): Promise<boolean> {
  const root = document.querySelector<HTMLElement>("#modal-root");
  if (!root) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const previousFocus = document.activeElement;
    const overlay = document.createElement("div");
    overlay.className = "modal-component";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "active-modal-title");

    const panel = document.createElement("div");
    panel.className = "modal-component__panel";

    const title = document.createElement("h2");
    title.id = "active-modal-title";
    title.textContent = options.title;

    const message = document.createElement("p");
    message.className = "modal-component__message";
    message.textContent = options.message;

    const actions = document.createElement("div");
    actions.className = "modal-component__actions";
    const cancel = createButton({
      label: options.cancelLabel ?? "ביטול",
      variant: "secondary"
    });
    const confirm = createButton({
      label: options.confirmLabel ?? "אישור",
      variant: "danger"
    });

    const close = (result: boolean): void => {
      overlay.remove();
      if (previousFocus instanceof HTMLElement) {
        previousFocus.focus();
      }
      resolve(result);
    };

    cancel.addEventListener("click", () => close(false));
    confirm.addEventListener("click", () => close(true));
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        close(false);
      }
    });
    overlay.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        close(false);
      }
    });

    actions.append(cancel, confirm);
    panel.append(title, message, actions);
    overlay.append(panel);
    root.replaceChildren(overlay);
    cancel.focus();
  });
}
