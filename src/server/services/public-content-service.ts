import {
  findPublicActivityById,
  findPublicGroupById,
  listPublicActivities,
  type ActivityRecord,
  type GroupRecord,
} from "../../../agents/db/domain/repo.js";
import { ServiceError } from "./service-error.js";

export interface PublicActivityResponse {
  id: number;
  name: string;
  activityType: string;
  audience: string;
  summary: string;
  description: string | null;
  imageUrl: string | null;
  priceAmount: string | null;
}

export interface PublicGroupResponse {
  id: number;
  activityId: number;
  name: string;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  scheduleText: string;
  capacity: number | null;
  registrationStatus: string;
  instructorName: string | null;
}

function mediaUrl(id: number | null): string | null {
  return id ? `/api/media/${id}` : null;
}

function toActivityResponse(activity: ActivityRecord): PublicActivityResponse {
  return {
    id: activity.id,
    name: activity.name,
    activityType: activity.activityType,
    audience: activity.audience,
    summary: activity.summary,
    description: activity.description,
    imageUrl: mediaUrl(activity.imageMediaAssetId),
    priceAmount: activity.priceAmount,
  };
}

function toGroupResponse(group: GroupRecord): PublicGroupResponse {
  return {
    id: group.id,
    activityId: group.activityId,
    name: group.name,
    description: group.description,
    startDate: group.startDate,
    endDate: group.endDate,
    scheduleText: group.scheduleText,
    capacity: group.capacity,
    registrationStatus: group.registrationStatus,
    instructorName: group.instructorName,
  };
}

export async function getPublicActivities(): Promise<PublicActivityResponse[]> {
  return (await listPublicActivities()).map(toActivityResponse);
}

export async function getPublicActivity(id: number): Promise<{
  activity: PublicActivityResponse;
  groups: PublicGroupResponse[];
}> {
  const result = await findPublicActivityById(id);
  if (!result) {
    throw new ServiceError(404, "PUBLIC_ACTIVITY_NOT_FOUND", "הפעילות לא נמצאה");
  }
  return {
    activity: toActivityResponse(result.activity),
    groups: result.groups.map(toGroupResponse),
  };
}

export async function getPublicGroup(id: number): Promise<{
  activity: PublicActivityResponse;
  group: PublicGroupResponse;
}> {
  const result = await findPublicGroupById(id);
  if (!result) {
    throw new ServiceError(404, "PUBLIC_GROUP_NOT_FOUND", "הקבוצה לא נמצאה");
  }
  return {
    activity: toActivityResponse(result.activity),
    group: toGroupResponse(result.group),
  };
}
