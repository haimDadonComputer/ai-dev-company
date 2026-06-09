import { ROUTES } from "../../app/config.js";
import { navigate } from "../../app/router.js";
import { setState } from "../../app/state.js";
import { setFormBusy, setFormMessage } from "../../components/form/script.js";
import { authService } from "../../services/auth-service.js";

export function mountLoginPage(root: HTMLElement): void {
  const form = root.querySelector<HTMLFormElement>(".login-page__form");
  const username = root.querySelector<HTMLInputElement>("#login-username");
  const password = root.querySelector<HTMLInputElement>("#login-password");
  if (!form || !username || !password) {
    throw new Error("מבנה עמוד ההתחברות אינו תקין.");
  }

  username.focus();
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFormMessage(form);

    if (!form.reportValidity()) {
      return;
    }

    setFormBusy(form, true);
    try {
      const user = await authService.login(username.value.trim(), password.value);
      setState({ user });
      navigate(user.mustChangePassword ? ROUTES.changePassword : ROUTES.adminGeneral, true);
    } catch {
      setFormMessage(form, "שם המשתמש או הסיסמה שגויים.");
      setFormBusy(form, false);
      password.select();
    }
  });
}
