import { ROUTES } from "../../app/config.js";
import { navigate } from "../../app/router.js";
import { getState, setState } from "../../app/state.js";
import { setFormBusy, setFormMessage } from "../../components/form/script.js";
import { notify } from "../../components/notification/script.js";
import { authService } from "../../services/auth-service.js";

export function mountChangePasswordPage(root: HTMLElement): void {
  const form = root.querySelector<HTMLFormElement>(".change-password-page__form");
  const currentPassword = root.querySelector<HTMLInputElement>("#current-password");
  const newPassword = root.querySelector<HTMLInputElement>("#new-password");
  const confirmPassword = root.querySelector<HTMLInputElement>("#confirm-password");
  if (!form || !currentPassword || !newPassword || !confirmPassword) {
    throw new Error("מבנה עמוד החלפת הסיסמה אינו תקין.");
  }

  currentPassword.focus();
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFormMessage(form);

    if (!form.reportValidity()) {
      return;
    }
    if (newPassword.value !== confirmPassword.value) {
      setFormMessage(form, "הסיסמאות החדשות אינן זהות.");
      confirmPassword.focus();
      return;
    }
    if (currentPassword.value === newPassword.value) {
      setFormMessage(form, "הסיסמה החדשה חייבת להיות שונה מהסיסמה הנוכחית.");
      newPassword.focus();
      return;
    }

    setFormBusy(form, true);
    try {
      await authService.changePassword(currentPassword.value, newPassword.value);
      const user = getState().user;
      if (user) {
        setState({ user: { ...user, mustChangePassword: false } });
      }
      notify("הסיסמה הוחלפה בהצלחה.", "success");
      navigate(ROUTES.adminGeneral, true);
    } catch {
      setFormMessage(form, "לא ניתן להחליף את הסיסמה. בדקו את הסיסמה הנוכחית.");
      setFormBusy(form, false);
    }
  });
}
