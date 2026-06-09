import { Router } from "express";
import {
  changePasswordController,
  loginController,
  logoutController,
  meController,
} from "../controllers/auth-controller.js";
import { requireAuthenticated } from "../middlewares/auth.js";

export const authRouter = Router();

authRouter.post("/login", loginController);
authRouter.post("/logout", requireAuthenticated, logoutController);
authRouter.get("/me", requireAuthenticated, meController);
authRouter.post("/change-password", requireAuthenticated, changePasswordController);
