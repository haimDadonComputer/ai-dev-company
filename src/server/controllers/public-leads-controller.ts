import type { NextFunction, Request, Response } from "express";
import {
  getPublicLeads,
  submitPublicLead,
} from "../services/public-leads-service.js";
import { sendSuccess } from "../utils/http.js";
import {
  validateListLeadsQuery,
  validatePublicLeadInput,
} from "../validators/public-leads.js";
import { handleControllerError } from "./error-response.js";

export async function submitPublicLeadController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    sendSuccess(
      response,
      { lead: await submitPublicLead(validatePublicLeadInput(request.body)) },
      201,
    );
  } catch (error) {
    handleControllerError(error, response, next);
  }
}

export async function listPublicLeadsController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    sendSuccess(response, {
      leads: await getPublicLeads(validateListLeadsQuery(request.query)),
    });
  } catch (error) {
    handleControllerError(error, response, next);
  }
}
