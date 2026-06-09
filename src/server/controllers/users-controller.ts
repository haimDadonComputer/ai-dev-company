import type { NextFunction, Request, Response } from "express";
import {
  changeUserStatus,
  createUser,
  getUser,
  getUsers,
  resetUserPassword,
  updateUser,
} from "../services/users-service.js";
import { sendSuccess } from "../utils/http.js";
import {
  validateCreateUserInput,
  validateListUsersQuery,
  validateResetPasswordInput,
  validateStatusInput,
  validateUpdateUserInput,
  validateUserId,
} from "../validators/users.js";
import { handleControllerError } from "./error-response.js";

export async function listUsersController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    sendSuccess(response, {
      users: await getUsers(validateListUsersQuery(request.query)),
    });
  } catch (error) {
    handleControllerError(error, response, next);
  }
}

export async function getUserController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = validateUserId(request.params.id);
    sendSuccess(response, await getUser(id));
  } catch (error) {
    handleControllerError(error, response, next);
  }
}

export async function createUserController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    sendSuccess(response, await createUser(validateCreateUserInput(request.body)), 201);
  } catch (error) {
    handleControllerError(error, response, next);
  }
}

export async function updateUserController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = validateUserId(request.params.id);
    sendSuccess(response, await updateUser(id, validateUpdateUserInput(request.body)));
  } catch (error) {
    handleControllerError(error, response, next);
  }
}

export async function resetUserPasswordController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = validateUserId(request.params.id);
    sendSuccess(response, {
      user: await resetUserPassword(id, validateResetPasswordInput(request.body)),
    });
  } catch (error) {
    handleControllerError(error, response, next);
  }
}

export async function updateUserStatusController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = validateUserId(request.params.id);
    sendSuccess(response, {
      user: await changeUserStatus(id, validateStatusInput(request.body)),
    });
  } catch (error) {
    handleControllerError(error, response, next);
  }
}
