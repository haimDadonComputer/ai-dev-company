import type { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/http.js";

export function notFound(request: Request, response: Response): void {
  sendError(response, 404, "NOT_FOUND", `לא נמצא נתיב: ${request.path}`);
}

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction
): void {
  console.error(error);
  if (!response.headersSent) {
    sendError(response, 500, "INTERNAL_ERROR", "אירעה שגיאה פנימית");
  }
}
