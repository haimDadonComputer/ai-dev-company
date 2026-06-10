import { apiRequest } from "./api.js";
import type { PublicActivity, PublicGroup } from "../types/app.js";

interface ActivitiesResponse {
  activities: PublicActivity[];
}

interface ActivityResponse {
  activity: PublicActivity;
  groups: PublicGroup[];
}

interface GroupResponse {
  activity: PublicActivity;
  group: PublicGroup;
}

export const activitiesService = {
  async listPublic(): Promise<PublicActivity[]> {
    const response = await apiRequest<ActivitiesResponse>("/api/public/activities");
    return response.activities;
  },

  getPublicActivity(id: number): Promise<ActivityResponse> {
    return apiRequest<ActivityResponse>(
      `/api/public/activities/${encodeURIComponent(String(id))}`
    );
  },

  getPublicGroup(id: number): Promise<GroupResponse> {
    return apiRequest<GroupResponse>(
      `/api/public/groups/${encodeURIComponent(String(id))}`
    );
  }
};
