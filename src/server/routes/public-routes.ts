import { Router } from "express";
import { getMediaController } from "../controllers/media-controller.js";
import { getPublicSettingsController } from "../controllers/settings-controller.js";

export const publicRouter = Router();

publicRouter.get("/public/settings", getPublicSettingsController);
publicRouter.get("/media/:id", getMediaController);
