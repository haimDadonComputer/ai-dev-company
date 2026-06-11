import { apiRequest } from "./api.js";
import type {
  AdminActivity,
  AdminActivityInput,
  AdminActivityWithGroups,
  AdminGroup,
  AdminGroupInput
} from "../types/app.js";

interface ActivitiesResponse {
  activities: AdminActivityWithGroups[];
}

interface ActivityResponse {
  activity: AdminActivity;
}

interface GroupResponse {
  group: AdminGroup;
}

export const adminActivitiesService = {
  async list(): Promise<AdminActivityWithGroups[]> {
    const response = await apiRequest<ActivitiesResponse>("/api/admin/activities");
    return response.activities;
  },

  async createActivity(input: AdminActivityInput): Promise<AdminActivity> {
    const response = await apiRequest<ActivityResponse>("/api/admin/activities", {
      method: "POST",
      body: input as unknown as Record<string, unknown>
    });
    return response.activity;
  },

  async updateActivity(id: number, input: AdminActivityInput): Promise<AdminActivity> {
    const response = await apiRequest<ActivityResponse>(
      `/api/admin/activities/${encodeURIComponent(String(id))}`,
      {
        method: "PUT",
        body: input as unknown as Record<string, unknown>
      }
    );
    return response.activity;
  },

  async createGroup(input: AdminGroupInput): Promise<AdminGroup> {
    const response = await apiRequest<GroupResponse>("/api/admin/groups", {
      method: "POST",
      body: input as unknown as Record<string, unknown>
    });
    return response.group;
  },

  async updateGroup(id: number, input: AdminGroupInput): Promise<AdminGroup> {
    const response = await apiRequest<GroupResponse>(
      `/api/admin/groups/${encodeURIComponent(String(id))}`,
      {
        method: "PUT",
        body: input as unknown as Record<string, unknown>
      }
    );
    return response.group;
  }
};
