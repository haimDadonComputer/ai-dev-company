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
  requireAdmin,
  requirePasswordChanged,
} from "../middlewares/auth.js";

export const adminRouter = Router();

adminRouter.use(requireAdmin, requirePasswordChanged);
adminRouter.get("/settings/general", getAdminSettingsController);
adminRouter.put("/settings/general", updateAdminSettingsController);
adminRouter.post("/media", uploadMediaController);
adminRouter.get("/media", listMediaController);
adminRouter.delete("/media/:id", deleteMediaController);
