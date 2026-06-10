import {
  createPublicLead,
  findPublicActivityById,
  findPublicGroupById,
  listPublicLeads,
  type PublicLeadRecord,
} from "../../../agents/db/domain/repo.js";
import { ServiceError } from "./service-error.js";
import type {
  ListLeadsQuery,
  PublicLeadInput,
} from "../validators/public-leads.js";

export interface PublicLeadResponse {
  id: number;
  activityId: number | null;
  groupId: number | null;
  activityName: string | null;
  groupName: string | null;
  fullName: string;
  phone: string;
  email: string | null;
  message: string | null;
  status: string;
  sourcePath: string;
  createdAt: Date;
  updatedAt: Date;
}

function toLeadResponse(lead: PublicLeadRecord): PublicLeadResponse {
  return {
    id: lead.id,
    activityId: lead.activityId,
    groupId: lead.groupId,
    activityName: lead.activityName,
    groupName: lead.groupName,
    fullName: lead.fullName,
    phone: lead.phone,
    email: lead.email,
    message: lead.message,
    status: lead.status,
    sourcePath: lead.sourcePath,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

export async function submitPublicLead(
  input: PublicLeadInput,
): Promise<PublicLeadResponse> {
  let activityId = input.activityId;
  let groupId = input.groupId;

  if (groupId) {
    const group = await findPublicGroupById(groupId);
    if (!group) {
      throw new ServiceError(400, "PUBLIC_GROUP_NOT_AVAILABLE", "הקבוצה אינה זמינה לפנייה");
    }
    activityId = group.activity.id;
  } else if (activityId && !(await findPublicActivityById(activityId))) {
    throw new ServiceError(400, "PUBLIC_ACTIVITY_NOT_AVAILABLE", "הפעילות אינה זמינה לפנייה");
  }

  return toLeadResponse(
    await createPublicLead({
      ...input,
      activityId,
      groupId,
    }),
  );
}

export async function getPublicLeads(
  query: ListLeadsQuery,
): Promise<PublicLeadResponse[]> {
  return (
    await listPublicLeads({
      limit: query.limit,
      offset: query.offset,
      status: query.status,
    })
  ).map(toLeadResponse);
}
