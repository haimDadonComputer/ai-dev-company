type NotificationKind = "success" | "error" | "info";

export function notify(message: string, kind: NotificationKind = "info"): void {
  const root = document.querySelector<HTMLElement>("#notification-root");
  if (!root) {
    return;
  }

  const notification = document.createElement("div");
  notification.className = `notification-component notification-component--${kind}`;
  notification.setAttribute("role", kind === "error" ? "alert" : "status");
  notification.textContent = message;
  root.append(notification);

  window.setTimeout(() => notification.remove(), 4500);
}
