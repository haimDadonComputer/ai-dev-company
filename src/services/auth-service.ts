import { apiRequest } from "./api.js";
import type { AuthUser } from "../types/app.js";

interface LoginResponse {
  user?: AuthUser;
  id?: number;
  username?: string;
  role?: "admin";
  mustChangePassword?: boolean;
  must_change_password?: boolean;
}

function normalizeUser(response: LoginResponse): AuthUser {
  const source = response.user ?? response;
  return {
    id: source.id ?? 0,
    username: source.username ?? "admin",
    role: source.role ?? "admin",
    mustChangePassword:
      source.mustChangePassword ?? source.must_change_password ?? false
  };
}

export const authService = {
  async login(username: string, password: string): Promise<AuthUser> {
    const response = await apiRequest<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: { username, password }
    });
    return normalizeUser(response);
  },

  async getCurrentUser(): Promise<AuthUser> {
    const response = await apiRequest<LoginResponse>("/api/auth/me");
    return normalizeUser(response);
  },

  logout(): Promise<void> {
    return apiRequest<void>("/api/auth/logout", { method: "POST" });
  },

  changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return apiRequest<void>("/api/auth/change-password", {
      method: "POST",
      body: { currentPassword, newPassword }
    });
  }
};
