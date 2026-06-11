import {
  createActivity,
  createGroup,
  findAdminActivityById,
  findMediaAssetById,
  findUserById,
  listAdminActivities,
  updateActivity,
  updateGroup,
  type ActivityRecord,
  type ActivityWithGroups,
  type GroupRecord,
} from "../../../agents/db/domain/repo.js";
import { ServiceError } from "./service-error.js";
import type {
  AdminActivityInput,
  AdminGroupInput,
} from "../validators/admin-activities.js";

export interface AdminActivityResponse {
  id: number;
  name: string;
  activityType: string;
  audience: string;
  summary: string;
  description: string | null;
  imageMediaAssetId: number | null;
  imageUrl: string | null;
  priceAmount: string | null;
  publishOnSite: boolean;
  status: string;
  createdByUserId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminGroupResponse {
  id: number;
  activityId: number;
  name: string;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  scheduleText: string;
  capacity: number | null;
  registrationStatus: string;
  publishOnSite: boolean;
  status: string;
  instructorUserId: number | null;
  instructorName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminActivityWithGroupsResponse {
  activity: AdminActivityResponse;
  groups: AdminGroupResponse[];
}

function mediaUrl(id: number | null): string | null {
  return id ? `/api/media/${id}` : null;
}

function toActivityResponse(activity: ActivityRecord): AdminActivityResponse {
  return {
    id: activity.id,
    name: activity.name,
    activityType: activity.activityType,
    audience: activity.audience,
    summary: activity.summary,
    description: activity.description,
    imageMediaAssetId: activity.imageMediaAssetId,
    imageUrl: mediaUrl(activity.imageMediaAssetId),
    priceAmount: activity.priceAmount,
    publishOnSite: activity.publishOnSite,
    status: activity.status,
    createdByUserId: activity.createdByUserId,
    createdAt: activity.createdAt,
    updatedAt: activity.updatedAt,
  };
}

function toGroupResponse(group: GroupRecord): AdminGroupResponse {
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
    publishOnSite: group.publishOnSite,
    status: group.status,
    instructorUserId: group.instructorUserId,
    instructorName: group.instructorName,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
  };
}

function toActivityWithGroupsResponse(
  item: ActivityWithGroups,
): AdminActivityWithGroupsResponse {
  return {
    activity: toActivityResponse(item.activity),
    groups: item.groups.map(toGroupResponse),
  };
}

async function validateActivityReferences(input: AdminActivityInput): Promise<void> {
  if (input.imageMediaAssetId && !(await findMediaAssetById(input.imageMediaAssetId))) {
    throw new ServiceError(400, "MEDIA_NOT_ACTIVE", "התמונה אינה קיימת או אינה פעילה");
  }
}

async function validateGroupReferences(input: AdminGroupInput): Promise<void> {
  if (!(await findAdminActivityById(input.activityId))) {
    throw new ServiceError(400, "ACTIVITY_NOT_FOUND", "הפעילות לא נמצאה");
  }
  if (input.instructorUserId) {
    const instructor = await findUserById(input.instructorUserId);
    if (!instructor || instructor.roleName !== "instructor" || instructor.status !== "active") {
      throw new ServiceError(400, "INSTRUCTOR_NOT_ACTIVE", "המדריך אינו קיים או אינו פעיל");
    }
  }
}

export async function getAdminActivities(): Promise<AdminActivityWithGroupsResponse[]> {
  return (await listAdminActivities()).map(toActivityWithGroupsResponse);
}

export async function saveAdminActivity(
  actorUserId: number,
  input: AdminActivityInput,
): Promise<AdminActivityResponse> {
  await validateActivityReferences(input);
  return toActivityResponse(
    await createActivity({
      ...input,
      createdByUserId: actorUserId,
    }),
  );
}

export async function editAdminActivity(
  id: number,
  input: AdminActivityInput,
): Promise<AdminActivityResponse> {
  await validateActivityReferences(input);
  const updated = await updateActivity(id, input);
  if (!updated) {
    throw new ServiceError(404, "ACTIVITY_NOT_FOUND", "הפעילות לא נמצאה");
  }
  return toActivityResponse(updated);
}

export async function saveAdminGroup(
  input: AdminGroupInput,
): Promise<AdminGroupResponse> {
  await validateGroupReferences(input);
  return toGroupResponse(await createGroup(input));
}

export async function editAdminGroup(
  id: number,
  input: AdminGroupInput,
): Promise<AdminGroupResponse> {
  await validateGroupReferences(input);
  const updated = await updateGroup(id, input);
  if (!updated) {
    throw new ServiceError(404, "GROUP_NOT_FOUND", "הקבוצה לא נמצאה");
  }
  return toGroupResponse(updated);
}
