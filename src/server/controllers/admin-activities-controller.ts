import type { NextFunction, Request, Response } from "express";
import {
  editAdminActivity,
  editAdminGroup,
  getAdminActivities,
  saveAdminActivity,
  saveAdminGroup,
} from "../services/admin-activities-service.js";
import { sendSuccess } from "../utils/http.js";
import {
  validateActivityInput,
  validateAdminId,
  validateGroupInput,
} from "../validators/admin-activities.js";
import { handleControllerError } from "./error-response.js";

export async function listAdminActivitiesController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    sendSuccess(response, { activities: await getAdminActivities() });
  } catch (error) {
    handleControllerError(error, response, next);
  }
}

export async function createAdminActivityController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    sendSuccess(
      response,
      {
        activity: await saveAdminActivity(
          request.auth?.userId ?? 0,
          validateActivityInput(request.body),
        ),
      },
      201,
    );
  } catch (error) {
    handleControllerError(error, response, next);
  }
}

export async function updateAdminActivityController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    sendSuccess(response, {
      activity: await editAdminActivity(
        validateAdminId(request.params.id),
        validateActivityInput(request.body),
      ),
    });
  } catch (error) {
    handleControllerError(error, response, next);
  }
}

export async function createAdminGroupController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    sendSuccess(
      response,
      { group: await saveAdminGroup(validateGroupInput(request.body)) },
      201,
    );
  } catch (error) {
    handleControllerError(error, response, next);
  }
}

export async function updateAdminGroupController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    sendSuccess(response, {
      group: await editAdminGroup(
        validateAdminId(request.params.id),
        validateGroupInput(request.body),
      ),
    });
  } catch (error) {
    handleControllerError(error, response, next);
  }
}
