interface ButtonOptions {
  label: string;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "danger";
}

export function createButton(options: ButtonOptions): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = options.type ?? "button";
  button.className = `button-component button-component--${options.variant ?? "primary"}`;
  button.textContent = options.label;
  return button;
}
