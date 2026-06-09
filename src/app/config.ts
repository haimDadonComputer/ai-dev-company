export const APP_NAME = "מערכת ניהול";
export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

export const ROUTES = {
  login: "/login",
  changePassword: "/change-password",
  adminGeneral: "/admin/general",
  adminUsers: "/admin/users",
  adminMedia: "/admin/media"
} as const;
