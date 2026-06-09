export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
  mustChangePassword: boolean;
  firstName?: string;
  lastName?: string;
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

export type UserRole = "student" | "instructor" | "admin";

export type UserStatus = "active" | "inactive" | "archived";

export interface ManagedUser {
  id: number;
  username: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: UserStatus;
  mustChangePassword: boolean;
  notes: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentProfile {
  userId?: number;
  nationalId: string | null;
  birthDate: string | null;
  fullAddress: string;
}

export interface InstructorProfile {
  userId?: number;
  expertiseAreas: string | null;
  biography: string | null;
  resumeFileId: number | null;
  certificationFileIds: number[] | null;
  notes: string | null;
}

export interface ManagedUserProfile {
  user: ManagedUser;
  student?: StudentProfile | null;
  instructor?: InstructorProfile | null;
}

export interface CreateManagedUserInput {
  username: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  notes: string | null;
  student?: StudentProfile;
  instructor?: InstructorProfile;
}

export interface UpdateManagedUserInput {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  notes: string | null;
  student?: Partial<StudentProfile>;
  instructor?: Partial<InstructorProfile>;
}
