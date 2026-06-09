import type { NextFunction, Request, Response } from "express";
import {
  getAdminSettings,
  getPublicSettings,
  saveSettings,
} from "../services/settings-service.js";
import { sendSuccess } from "../utils/http.js";
import { validateSettingsInput } from "../validators/settings.js";
import { handleControllerError } from "./error-response.js";

export async function getAdminSettingsController(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    sendSuccess(response, { settings: await getAdminSettings() });
  } catch (error) {
    handleControllerError(error, response, next);
  }
}

export async function updateAdminSettingsController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const update = validateSettingsInput(request.body);
    const settings = await saveSettings(request.auth!.userId, update);
    sendSuccess(response, { settings });
  } catch (error) {
    handleControllerError(error, response, next);
  }
}

export async function getPublicSettingsController(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    sendSuccess(response, { settings: await getPublicSettings() });
  } catch (error) {
    handleControllerError(error, response, next);
  }
}
