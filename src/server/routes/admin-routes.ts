import { Router } from "express";
import {
  deleteMediaController,
  listMediaController,
  uploadMediaController,
} from "../controllers/media-controller.js";
import {
  getAdminSettingsController,
  updateAdminSettingsController,
} from "../controllers/settings-controller.js";
import {
  createUserController,
  getUserController,
  listUsersController,
  resetUserPasswordController,
  updateUserController,
  updateUserStatusController,
} from "../controllers/users-controller.js";
import {
  requireAdmin,
  requirePasswordChanged,
} from "../middlewares/auth.js";

export const adminRouter = Router();

adminRouter.use(requireAdmin, requirePasswordChanged);
adminRouter.get("/settings/general", getAdminSettingsController);
adminRouter.put("/settings/general", updateAdminSettingsController);
adminRouter.get("/users", listUsersController);
adminRouter.post("/users", createUserController);
adminRouter.get("/users/:id", getUserController);
adminRouter.put("/users/:id", updateUserController);
adminRouter.post("/users/:id/reset-password", resetUserPasswordController);
adminRouter.patch("/users/:id/status", updateUserStatusController);
adminRouter.post("/media", uploadMediaController);
adminRouter.get("/media", listMediaController);
adminRouter.delete("/media/:id", deleteMediaController);
