import type { NextFunction, Request, Response } from "express";
import {
  getPublicActivities,
  getPublicActivity,
  getPublicGroup,
} from "../services/public-content-service.js";
import { sendSuccess } from "../utils/http.js";
import { validatePublicId } from "../validators/public-content.js";
import { handleControllerError } from "./error-response.js";

export async function listPublicActivitiesController(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    sendSuccess(response, { activities: await getPublicActivities() });
  } catch (error) {
    handleControllerError(error, response, next);
  }
}

export async function getPublicActivityController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    sendSuccess(
      response,
      await getPublicActivity(validatePublicId(request.params.activityId)),
    );
  } catch (error) {
    handleControllerError(error, response, next);
  }
}

export async function getPublicGroupController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    sendSuccess(
      response,
      await getPublicGroup(validatePublicId(request.params.groupId)),
    );
  } catch (error) {
    handleControllerError(error, response, next);
  }
}
