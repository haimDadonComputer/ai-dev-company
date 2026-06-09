import { Router } from "express";
import {
  changePasswordController,
  loginController,
  logoutController,
  meController,
} from "../controllers/auth-controller.js";
import { requireAdmin } from "../middlewares/auth.js";

export const authRouter = Router();

authRouter.post("/login", loginController);
authRouter.post("/logout", requireAdmin, logoutController);
authRouter.get("/me", requireAdmin, meController);
authRouter.post("/change-password", requireAdmin, changePasswordController);
