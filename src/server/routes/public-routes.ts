import { Router } from "express";
import { getMediaController } from "../controllers/media-controller.js";
import { submitPublicLeadController } from "../controllers/public-leads-controller.js";
import {
  getPublicActivityController,
  getPublicGroupController,
  listPublicActivitiesController,
} from "../controllers/public-content-controller.js";
import { getPublicSettingsController } from "../controllers/settings-controller.js";

export const publicRouter = Router();

publicRouter.get("/public/settings", getPublicSettingsController);
publicRouter.get("/public/activities", listPublicActivitiesController);
publicRouter.get("/public/activities/:activityId", getPublicActivityController);
publicRouter.get("/public/groups/:groupId", getPublicGroupController);
publicRouter.post("/public/leads", submitPublicLeadController);
publicRouter.get("/media/:id", getMediaController);
