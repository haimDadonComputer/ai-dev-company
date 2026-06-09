export interface AuthUser {
  id: number;
  username: string;
  role: "admin";
  mustChangePassword: boolean;
}

export interface AppState {
  user: AuthUser | null;
  loading: boolean;
}

export interface MediaAsset {
  id: number;
  fileName: string;
  altText: string;
  mimeType: "image/png" | "image/jpeg" | "image/webp";
  size: number;
  url: string;
  createdAt?: string;
}

export interface GeneralSettings {
  siteName: string;
  slogan: string;
  phone: string;
  address: string;
  whatsapp: string;
  instagram: string;
  email: string;
  logoMediaId: number | null;
  imageMediaIds: number[];
}

export interface ApiErrorBody {
  message?: string;
  error?: string;
}
