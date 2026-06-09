import { apiRequest } from "./api.js";
import type {
  CreateManagedUserInput,
  ManagedUser,
  ManagedUserProfile,
  UpdateManagedUserInput,
  UserRole,
  UserStatus
} from "../types/app.js";

interface UsersListResponse {
  users: ManagedUser[];
}

interface PasswordResetResponse {
  user: ManagedUser;
}

interface StatusUpdateResponse {
  user: ManagedUser;
}

export interface UsersFilter {
  role?: UserRole;
  status?: UserStatus;
}

function queryFromFilter(filter: UsersFilter): string {
  const params = new URLSearchParams();
  if (filter.role) {
    params.set("role", filter.role);
  }
  if (filter.status) {
    params.set("status", filter.status);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export const usersService = {
  async list(filter: UsersFilter = {}): Promise<ManagedUser[]> {
    const response = await apiRequest<UsersListResponse>(
      `/api/admin/users${queryFromFilter(filter)}`
    );
    return response.users;
  },

  get(id: number): Promise<ManagedUserProfile> {
    return apiRequest<ManagedUserProfile>(
      `/api/admin/users/${encodeURIComponent(String(id))}`
    );
  },

  create(input: CreateManagedUserInput): Promise<ManagedUserProfile> {
    return apiRequest<ManagedUserProfile>("/api/admin/users", {
      method: "POST",
      body: input as unknown as Record<string, unknown>
    });
  },

  update(id: number, input: UpdateManagedUserInput): Promise<ManagedUserProfile> {
    return apiRequest<ManagedUserProfile>(
      `/api/admin/users/${encodeURIComponent(String(id))}`,
      {
        method: "PUT",
        body: input as unknown as Record<string, unknown>
      }
    );
  },

  async resetPassword(id: number, newPassword: string): Promise<ManagedUser> {
    const response = await apiRequest<PasswordResetResponse>(
      `/api/admin/users/${encodeURIComponent(String(id))}/reset-password`,
      {
        method: "POST",
        body: { newPassword }
      }
    );
    return response.user;
  },

  async updateStatus(id: number, status: UserStatus): Promise<ManagedUser> {
    const response = await apiRequest<StatusUpdateResponse>(
      `/api/admin/users/${encodeURIComponent(String(id))}/status`,
      {
        method: "PATCH",
        body: { status }
      }
    );
    return response.user;
  }
};
