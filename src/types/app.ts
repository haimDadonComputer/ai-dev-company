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
  logoUrl?: string | null;
  imageMediaIds: number[];
  imageUrls?: string[];
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

export interface PublicActivity {
  id: number;
  name: string;
  activityType: string;
  audience: string;
  summary: string;
  description: string | null;
  imageUrl: string | null;
  priceAmount: string | null;
}

export interface PublicGroup {
  id: number;
  activityId: number;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  scheduleText: string;
  capacity: number | null;
  registrationStatus: "open" | "closed" | "full" | "archived";
  instructorName: string | null;
}

export type PublicLeadStatus = "new" | "contacted" | "closed" | "archived";

export interface PublicLead {
  id: number;
  activityId: number | null;
  groupId: number | null;
  activityName: string | null;
  groupName: string | null;
  fullName: string;
  phone: string;
  email: string | null;
  message: string | null;
  status: PublicLeadStatus;
  sourcePath: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePublicLeadInput {
  activityId: number | null;
  groupId: number | null;
  fullName: string;
  phone: string;
  email: string | null;
  message: string | null;
  sourcePath: string;
}

export type ActivityStatus = "active" | "inactive" | "archived";
export type GroupRegistrationStatus = "open" | "closed" | "full" | "archived";

export interface AdminActivity {
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
  status: ActivityStatus;
  createdByUserId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminGroup {
  id: number;
  activityId: number;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  scheduleText: string;
  capacity: number | null;
  registrationStatus: GroupRegistrationStatus;
  publishOnSite: boolean;
  status: ActivityStatus;
  instructorUserId: number | null;
  instructorName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminActivityWithGroups {
  activity: AdminActivity;
  groups: AdminGroup[];
}

export interface AdminActivityInput {
  name: string;
  activityType: string;
  audience: string;
  summary: string;
  description: string | null;
  imageMediaAssetId: number | null;
  priceAmount: string | null;
  publishOnSite: boolean;
  status: ActivityStatus;
}

export interface AdminGroupInput {
  activityId: number;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  scheduleText: string;
  capacity: number | null;
  registrationStatus: GroupRegistrationStatus;
  publishOnSite: boolean;
  status: ActivityStatus;
  instructorUserId: number | null;
}
