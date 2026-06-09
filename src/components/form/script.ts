export function setFormBusy(form: HTMLFormElement, busy: boolean): void {
  form.setAttribute("aria-busy", String(busy));
  form.querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    "button, input, select, textarea"
  ).forEach((control) => {
    control.disabled = busy;
  });
}

export function setFormMessage(form: HTMLFormElement, message = ""): void {
  const output = form.querySelector<HTMLElement>(".form-component__message");
  if (!output) {
    return;
  }
  output.textContent = message;
  output.hidden = message.length === 0;
}
