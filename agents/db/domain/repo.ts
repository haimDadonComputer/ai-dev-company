import {
  PoolConnection,
  createPool,
  Pool,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

if (existsSync(".env")) {
  loadEnvFile(".env");
}

export interface UserRecord {
  id: number;
  username: string;
  passwordHash: string;
  passwordSalt: string;
  roleName: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: string;
  isActive: boolean;
  mustChangePassword: boolean;
  notes: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = "student" | "instructor" | "admin";
export type UserStatus = "active" | "inactive" | "archived";

export interface StudentRecord {
  id: number;
  userId: number;
  nationalId: string | null;
  birthDate: Date | null;
  fullAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InstructorRecord {
  id: number;
  userId: number;
  expertiseAreas: string | null;
  biography: string | null;
  resumeFileId: number | null;
  certificationFileIds: number[] | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  username: string;
  passwordHash: string;
  passwordSalt: string;
  roleName: UserRole;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  notes: string | null;
  student?: {
    nationalId: string | null;
    birthDate: string | null;
    fullAddress: string;
  };
  instructor?: {
    expertiseAreas: string | null;
    biography: string | null;
    resumeFileId: number | null;
    certificationFileIds: number[] | null;
    notes: string | null;
  };
}

export interface UserUpdateInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  notes?: string | null;
  student?: {
    nationalId?: string | null;
    birthDate?: string | null;
    fullAddress?: string;
  };
  instructor?: {
    expertiseAreas?: string | null;
    biography?: string | null;
    resumeFileId?: number | null;
    certificationFileIds?: number[] | null;
    notes?: string | null;
  };
}

export interface UserListOptions {
  limit?: number;
  offset?: number;
  roleName?: UserRole;
  status?: UserStatus;
}

export interface UserWithProfile {
  user: UserRecord;
  student: StudentRecord | null;
  instructor: InstructorRecord | null;
}

export interface SiteSettingsRecord {
  id: number;
  siteName: string;
  slogan: string;
  phone: string;
  address: string;
  whatsapp: string;
  instagram: string;
  email: string;
  logoMediaAssetId: number | null;
  additionalMediaAssetIds: number[] | null;
  updatedByUserId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteSettingsUpdate {
  siteName?: string;
  slogan?: string;
  phone?: string;
  address?: string;
  whatsapp?: string;
  instagram?: string;
  email?: string;
  logoMediaAssetId?: number | null;
  additionalMediaAssetIds?: number[] | null;
}

export interface MediaAssetRecord {
  id: number;
  originalName: string;
  storageName: string;
  storagePath: string;
  mimeType: string;
  extension: string;
  sizeBytes: number;
  sha256: string;
  altText: string | null;
  uploadedByUserId: number;
  createdAt: Date;
  deletedAt: Date | null;
  deletedByUserId: number | null;
}

export interface CreateMediaAssetInput {
  originalName: string;
  storageName: string;
  storagePath: string;
  mimeType: string;
  extension: string;
  sizeBytes: number;
  sha256: string;
  altText: string | null;
  uploadedByUserId: number;
}

export interface MediaAssetListOptions {
  limit?: number;
  offset?: number;
  includeDeleted?: boolean;
}

export interface ActivityRecord {
  id: number;
  name: string;
  activityType: string;
  audience: string;
  summary: string;
  description: string | null;
  imageMediaAssetId: number | null;
  priceAmount: string | null;
  publishOnSite: boolean;
  status: string;
  createdByUserId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupRecord {
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

export interface ActivityWithGroups {
  activity: ActivityRecord;
  groups: GroupRecord[];
}

export interface ActivityInput {
  name: string;
  activityType: string;
  audience: string;
  summary: string;
  description: string | null;
  imageMediaAssetId: number | null;
  priceAmount: string | null;
  publishOnSite: boolean;
  status: string;
  createdByUserId?: number | null;
}

export interface GroupInput {
  activityId: number;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  scheduleText: string;
  capacity: number | null;
  registrationStatus: string;
  publishOnSite: boolean;
  status: string;
  instructorUserId: number | null;
}

export type PublicLeadStatus = "new" | "contacted" | "closed" | "archived";

export interface PublicLeadRecord {
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
  createdAt: Date;
  updatedAt: Date;
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

export interface PublicLeadListOptions {
  limit?: number;
  offset?: number;
  status?: PublicLeadStatus;
}

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  password_hash: string;
  password_salt: string;
  role_name: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  status: string;
  is_active: number;
  must_change_password: number;
  notes: string | null;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface SiteSettingsRow extends RowDataPacket {
  id: number;
  site_name: string;
  slogan: string;
  phone: string;
  address: string;
  whatsapp: string;
  instagram: string;
  email: string;
  logo_media_asset_id: number | null;
  additional_media_asset_ids: string | number[] | null;
  updated_by_user_id: number | null;
  created_at: Date;
  updated_at: Date;
}

interface MediaAssetRow extends RowDataPacket {
  id: number;
  original_name: string;
  storage_name: string;
  storage_path: string;
  mime_type: string;
  extension: string;
  size_bytes: number;
  sha256: string;
  alt_text: string | null;
  uploaded_by_user_id: number;
  created_at: Date;
  deleted_at: Date | null;
  deleted_by_user_id: number | null;
}

interface StudentRow extends RowDataPacket {
  id: number;
  user_id: number;
  national_id: string | null;
  birth_date: Date | null;
  full_address: string;
  created_at: Date;
  updated_at: Date;
}

interface InstructorRow extends RowDataPacket {
  id: number;
  user_id: number;
  expertise_areas: string | null;
  biography: string | null;
  resume_file_id: number | null;
  certification_file_ids: string | number[] | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

interface ActivityRow extends RowDataPacket {
  id: number;
  name: string;
  activity_type: string;
  audience: string;
  summary: string;
  description: string | null;
  image_media_asset_id: number | null;
  price_amount: string | null;
  publish_on_site: number;
  status: string;
  created_by_user_id: number | null;
  created_at: Date;
  updated_at: Date;
}

interface GroupRow extends RowDataPacket {
  id: number;
  activity_id: number;
  name: string;
  description: string | null;
  start_date: Date | null;
  end_date: Date | null;
  schedule_text: string;
  capacity: number | null;
  registration_status: string;
  publish_on_site: number;
  status: string;
  instructor_user_id: number | null;
  instructor_name: string | null;
  created_at: Date;
  updated_at: Date;
}

interface PublicLeadRow extends RowDataPacket {
  id: number;
  activity_id: number | null;
  group_id: number | null;
  activity_name: string | null;
  group_name: string | null;
  full_name: string;
  phone: string;
  email: string | null;
  message: string | null;
  status: PublicLeadStatus;
  source_path: string;
  created_at: Date;
  updated_at: Date;
}

const requiredEnvironmentVariables = [
  "DB_HOST",
  "DB_USER",
  "DB_NAME",
] as const;

for (const variableName of requiredEnvironmentVariables) {
  if (!process.env[variableName]) {
    throw new Error(`Missing required environment variable: ${variableName}`);
  }
}

const pool: Pool = createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? "3306"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT ?? "10"),
  queueLimit: 0,
  charset: "utf8mb4",
  timezone: "Z",
  dateStrings: false,
  supportBigNumbers: true,
  bigNumberStrings: false,
});

function mapUser(row: UserRow): UserRecord {
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    passwordSalt: row.password_salt,
    roleName: row.role_name,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    email: row.email,
    status: row.status,
    isActive: Boolean(row.is_active),
    mustChangePassword: Boolean(row.must_change_password),
    notes: row.notes,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseMediaIds(value: string | number[] | null): number[] | null {
  if (value === null) {
    return null;
  }

  if (Array.isArray(value)) {
    return value.map(Number);
  }

  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || !parsed.every((item) => Number.isInteger(item))) {
    throw new Error("Invalid additional_media_asset_ids value in database");
  }

  return parsed as number[];
}

function mapSiteSettings(row: SiteSettingsRow): SiteSettingsRecord {
  return {
    id: row.id,
    siteName: row.site_name,
    slogan: row.slogan,
    phone: row.phone,
    address: row.address,
    whatsapp: row.whatsapp,
    instagram: row.instagram,
    email: row.email,
    logoMediaAssetId: row.logo_media_asset_id,
    additionalMediaAssetIds: parseMediaIds(row.additional_media_asset_ids),
    updatedByUserId: row.updated_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMediaAsset(row: MediaAssetRow): MediaAssetRecord {
  return {
    id: row.id,
    originalName: row.original_name,
    storageName: row.storage_name,
    storagePath: row.storage_path,
    mimeType: row.mime_type,
    extension: row.extension,
    sizeBytes: row.size_bytes,
    sha256: row.sha256,
    altText: row.alt_text,
    uploadedByUserId: row.uploaded_by_user_id,
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
    deletedByUserId: row.deleted_by_user_id,
  };
}

function mapStudent(row: StudentRow): StudentRecord {
  return {
    id: row.id,
    userId: row.user_id,
    nationalId: row.national_id,
    birthDate: row.birth_date,
    fullAddress: row.full_address,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapInstructor(row: InstructorRow): InstructorRecord {
  return {
    id: row.id,
    userId: row.user_id,
    expertiseAreas: row.expertise_areas,
    biography: row.biography,
    resumeFileId: row.resume_file_id,
    certificationFileIds: parseMediaIds(row.certification_file_ids),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapActivity(row: ActivityRow): ActivityRecord {
  return {
    id: row.id,
    name: row.name,
    activityType: row.activity_type,
    audience: row.audience,
    summary: row.summary,
    description: row.description,
    imageMediaAssetId: row.image_media_asset_id,
    priceAmount: row.price_amount,
    publishOnSite: Boolean(row.publish_on_site),
    status: row.status,
    createdByUserId: row.created_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapGroup(row: GroupRow): GroupRecord {
  return {
    id: row.id,
    activityId: row.activity_id,
    name: row.name,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    scheduleText: row.schedule_text,
    capacity: row.capacity,
    registrationStatus: row.registration_status,
    publishOnSite: Boolean(row.publish_on_site),
    status: row.status,
    instructorUserId: row.instructor_user_id,
    instructorName: row.instructor_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPublicLead(row: PublicLeadRow): PublicLeadRecord {
  return {
    id: row.id,
    activityId: row.activity_id,
    groupId: row.group_id,
    activityName: row.activity_name,
    groupName: row.group_name,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    message: row.message,
    status: row.status,
    sourcePath: row.source_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const userSelect = `SELECT id, username, password_hash, password_salt, role_name,
          is_active, first_name, last_name, phone, email, status,
          must_change_password, notes, last_login_at, created_at, updated_at
     FROM users`;

const publicActivitySelect = `SELECT id, name, activity_type, audience, summary,
          description, image_media_asset_id, CAST(price_amount AS CHAR) AS price_amount,
          publish_on_site, status, created_by_user_id, created_at, updated_at
     FROM activities
    WHERE publish_on_site = TRUE
      AND status = 'active'`;

const adminActivitySelect = `SELECT id, name, activity_type, audience, summary,
          description, image_media_asset_id, CAST(price_amount AS CHAR) AS price_amount,
          publish_on_site, status, created_by_user_id, created_at, updated_at
     FROM activities`;

const publicGroupSelect = `SELECT g.id, g.activity_id, g.name, g.description,
          g.start_date, g.end_date, g.schedule_text, g.capacity,
          g.registration_status, g.publish_on_site, g.status,
          g.instructor_user_id,
          NULLIF(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')), ' ') AS instructor_name,
          g.created_at, g.updated_at
     FROM \`groups\` g
     LEFT JOIN users u ON u.id = g.instructor_user_id
    WHERE g.publish_on_site = TRUE
      AND g.status = 'active'`;

const adminGroupSelect = `SELECT g.id, g.activity_id, g.name, g.description,
          g.start_date, g.end_date, g.schedule_text, g.capacity,
          g.registration_status, g.publish_on_site, g.status,
          g.instructor_user_id,
          NULLIF(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')), ' ') AS instructor_name,
          g.created_at, g.updated_at
     FROM \`groups\` g
     LEFT JOIN users u ON u.id = g.instructor_user_id`;

const publicLeadSelect = `SELECT l.id, l.activity_id, l.group_id,
          a.name AS activity_name, g.name AS group_name,
          l.full_name, l.phone, l.email, l.message, l.status,
          l.source_path, l.created_at, l.updated_at
     FROM public_leads l
     LEFT JOIN activities a ON a.id = l.activity_id
     LEFT JOIN \`groups\` g ON g.id = l.group_id`;

async function findUserByIdWithConnection(
  connection: PoolConnection,
  id: number,
): Promise<UserRecord | null> {
  const [rows] = await connection.execute<UserRow[]>(
    `${userSelect} WHERE id = ? LIMIT 1`,
    [id],
  );
  return rows[0] ? mapUser(rows[0]) : null;
}

async function findStudentByUserId(
  connection: PoolConnection | Pool,
  userId: number,
): Promise<StudentRecord | null> {
  const [rows] = await connection.execute<StudentRow[]>(
    `SELECT id, user_id, national_id, birth_date, full_address,
            created_at, updated_at
       FROM students
      WHERE user_id = ?
      LIMIT 1`,
    [userId],
  );
  return rows[0] ? mapStudent(rows[0]) : null;
}

async function findInstructorByUserId(
  connection: PoolConnection | Pool,
  userId: number,
): Promise<InstructorRecord | null> {
  const [rows] = await connection.execute<InstructorRow[]>(
    `SELECT id, user_id, expertise_areas, biography, resume_file_id,
            certification_file_ids, notes, created_at, updated_at
       FROM instructors
      WHERE user_id = ?
      LIMIT 1`,
    [userId],
  );
  return rows[0] ? mapInstructor(rows[0]) : null;
}

export async function findUserByUsername(
  username: string,
): Promise<UserRecord | null> {
  const [rows] = await pool.execute<UserRow[]>(
    `${userSelect} WHERE username = ? LIMIT 1`,
    [username],
  );

  return rows[0] ? mapUser(rows[0]) : null;
}

export async function findUserById(id: number): Promise<UserRecord | null> {
  const [rows] = await pool.execute<UserRow[]>(
    `${userSelect} WHERE id = ? LIMIT 1`,
    [id],
  );

  return rows[0] ? mapUser(rows[0]) : null;
}

export async function findUserWithProfileById(
  id: number,
): Promise<UserWithProfile | null> {
  const user = await findUserById(id);
  if (!user) {
    return null;
  }
  const [student, instructor] = await Promise.all([
    user.roleName === "student" ? findStudentByUserId(pool, id) : null,
    user.roleName === "instructor" ? findInstructorByUserId(pool, id) : null,
  ]);
  return { user, student, instructor };
}

export async function listUsers(
  options: UserListOptions = {},
): Promise<UserRecord[]> {
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 200);
  const offset = Math.max(options.offset ?? 0, 0);
  const filters: string[] = [];
  const values: Array<string | number> = [];

  if (options.roleName) {
    filters.push("role_name = ?");
    values.push(options.roleName);
  }
  if (options.status) {
    filters.push("status = ?");
    values.push(options.status);
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const [rows] = await pool.query<UserRow[]>(
    `${userSelect}
       ${where}
      ORDER BY id DESC
      LIMIT ? OFFSET ?`,
    [...values, limit, offset],
  );

  return rows.map(mapUser);
}

export async function createUserWithProfile(
  input: CreateUserInput,
): Promise<UserWithProfile> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO users (
         username, password_hash, password_salt, role_name,
         first_name, last_name, phone, email, status,
         is_active, must_change_password, notes
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', TRUE, FALSE, ?)`,
      [
        input.username,
        input.passwordHash,
        input.passwordSalt,
        input.roleName,
        input.firstName,
        input.lastName,
        input.phone,
        input.email,
        input.notes,
      ],
    );

    const userId = result.insertId;
    if (input.roleName === "student") {
      await connection.execute<ResultSetHeader>(
        `INSERT INTO students (user_id, national_id, birth_date, full_address)
         VALUES (?, ?, ?, ?)`,
        [
          userId,
          input.student?.nationalId ?? null,
          input.student?.birthDate ?? null,
          input.student?.fullAddress ?? "",
        ],
      );
    }
    if (input.roleName === "instructor") {
      await connection.execute<ResultSetHeader>(
        `INSERT INTO instructors (
           user_id, expertise_areas, biography, resume_file_id,
           certification_file_ids, notes
         ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          input.instructor?.expertiseAreas ?? null,
          input.instructor?.biography ?? null,
          input.instructor?.resumeFileId ?? null,
          input.instructor?.certificationFileIds
            ? JSON.stringify(input.instructor.certificationFileIds)
            : null,
          input.instructor?.notes ?? null,
        ],
      );
    }

    const user = await findUserByIdWithConnection(connection, userId);
    if (!user) {
      throw new Error("Created user could not be loaded");
    }
    const student =
      user.roleName === "student" ? await findStudentByUserId(connection, userId) : null;
    const instructor =
      user.roleName === "instructor"
        ? await findInstructorByUserId(connection, userId)
        : null;
    await connection.commit();
    return { user, student, instructor };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateUserIdentity(
  userId: number,
  input: UserUpdateInput,
): Promise<UserWithProfile | null> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const assignments: string[] = [];
    const values: Array<string | number | null> = [];

    if (input.firstName !== undefined) {
      assignments.push("first_name = ?");
      values.push(input.firstName);
    }
    if (input.lastName !== undefined) {
      assignments.push("last_name = ?");
      values.push(input.lastName);
    }
    if (input.phone !== undefined) {
      assignments.push("phone = ?");
      values.push(input.phone);
    }
    if (input.email !== undefined) {
      assignments.push("email = ?");
      values.push(input.email);
    }
    if (input.notes !== undefined) {
      assignments.push("notes = ?");
      values.push(input.notes);
    }

    if (assignments.length) {
      assignments.push("updated_at = CURRENT_TIMESTAMP(3)");
      await connection.execute<ResultSetHeader>(
        `UPDATE users SET ${assignments.join(", ")} WHERE id = ?`,
        [...values, userId],
      );
    }

    const user = await findUserByIdWithConnection(connection, userId);
    if (!user) {
      await connection.rollback();
      return null;
    }

    if (user.roleName === "student" && input.student) {
      const studentAssignments: string[] = [];
      const studentValues: Array<string | number | null> = [];
      if (input.student.nationalId !== undefined) {
        studentAssignments.push("national_id = ?");
        studentValues.push(input.student.nationalId);
      }
      if (input.student.birthDate !== undefined) {
        studentAssignments.push("birth_date = ?");
        studentValues.push(input.student.birthDate);
      }
      if (input.student.fullAddress !== undefined) {
        studentAssignments.push("full_address = ?");
        studentValues.push(input.student.fullAddress);
      }
      if (studentAssignments.length) {
        studentAssignments.push("updated_at = CURRENT_TIMESTAMP(3)");
        await connection.execute<ResultSetHeader>(
          `UPDATE students SET ${studentAssignments.join(", ")} WHERE user_id = ?`,
          [...studentValues, userId],
        );
      }
    }

    if (user.roleName === "instructor" && input.instructor) {
      const instructorAssignments: string[] = [];
      const instructorValues: Array<string | number | null> = [];
      if (input.instructor.expertiseAreas !== undefined) {
        instructorAssignments.push("expertise_areas = ?");
        instructorValues.push(input.instructor.expertiseAreas);
      }
      if (input.instructor.biography !== undefined) {
        instructorAssignments.push("biography = ?");
        instructorValues.push(input.instructor.biography);
      }
      if (input.instructor.resumeFileId !== undefined) {
        instructorAssignments.push("resume_file_id = ?");
        instructorValues.push(input.instructor.resumeFileId);
      }
      if (input.instructor.certificationFileIds !== undefined) {
        instructorAssignments.push("certification_file_ids = ?");
        instructorValues.push(
          input.instructor.certificationFileIds === null
            ? null
            : JSON.stringify(input.instructor.certificationFileIds),
        );
      }
      if (input.instructor.notes !== undefined) {
        instructorAssignments.push("notes = ?");
        instructorValues.push(input.instructor.notes);
      }
      if (instructorAssignments.length) {
        instructorAssignments.push("updated_at = CURRENT_TIMESTAMP(3)");
        await connection.execute<ResultSetHeader>(
          `UPDATE instructors SET ${instructorAssignments.join(", ")} WHERE user_id = ?`,
          [...instructorValues, userId],
        );
      }
    }

    const updated = await findUserByIdWithConnection(connection, userId);
    if (!updated) {
      throw new Error("Updated user could not be loaded");
    }
    const student =
      updated.roleName === "student"
        ? await findStudentByUserId(connection, userId)
        : null;
    const instructor =
      updated.roleName === "instructor"
        ? await findInstructorByUserId(connection, userId)
        : null;
    await connection.commit();
    return { user: updated, student, instructor };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateUserStatus(
  userId: number,
  status: UserStatus,
): Promise<UserRecord | null> {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE users
        SET status = ?,
            is_active = ?,
            updated_at = CURRENT_TIMESTAMP(3)
      WHERE id = ?`,
    [status, status === "active", userId],
  );
  if (result.affectedRows !== 1) {
    return null;
  }
  return findUserById(userId);
}

export async function updateUserPassword(
  userId: number,
  passwordHash: string,
  passwordSalt: string,
  mustChangePassword = false,
): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE users
        SET password_hash = ?,
            password_salt = ?,
            must_change_password = ?,
            updated_at = CURRENT_TIMESTAMP(3)
      WHERE id = ?`,
    [passwordHash, passwordSalt, mustChangePassword, userId],
  );

  return result.affectedRows === 1;
}

export async function getSiteSettings(): Promise<SiteSettingsRecord | null> {
  const [rows] = await pool.execute<SiteSettingsRow[]>(
    `SELECT id, site_name, slogan, phone, address, whatsapp, instagram, email,
            logo_media_asset_id, additional_media_asset_ids,
            updated_by_user_id, created_at, updated_at
       FROM site_settings
      WHERE id = 1
      LIMIT 1`,
  );

  return rows[0] ? mapSiteSettings(rows[0]) : null;
}

export async function updateSiteSettings(
  actorUserId: number,
  fields: SiteSettingsUpdate,
): Promise<SiteSettingsRecord | null> {
  const assignments: string[] = [];
  const values: Array<string | number | null> = [];

  if (fields.siteName !== undefined) {
    assignments.push("site_name = ?");
    values.push(fields.siteName);
  }
  if (fields.slogan !== undefined) {
    assignments.push("slogan = ?");
    values.push(fields.slogan);
  }
  if (fields.phone !== undefined) {
    assignments.push("phone = ?");
    values.push(fields.phone);
  }
  if (fields.address !== undefined) {
    assignments.push("address = ?");
    values.push(fields.address);
  }
  if (fields.whatsapp !== undefined) {
    assignments.push("whatsapp = ?");
    values.push(fields.whatsapp);
  }
  if (fields.instagram !== undefined) {
    assignments.push("instagram = ?");
    values.push(fields.instagram);
  }
  if (fields.email !== undefined) {
    assignments.push("email = ?");
    values.push(fields.email);
  }
  if (fields.logoMediaAssetId !== undefined) {
    assignments.push("logo_media_asset_id = ?");
    values.push(fields.logoMediaAssetId);
  }
  if (fields.additionalMediaAssetIds !== undefined) {
    assignments.push("additional_media_asset_ids = ?");
    values.push(
      fields.additionalMediaAssetIds === null
        ? null
        : JSON.stringify(fields.additionalMediaAssetIds),
    );
  }

  assignments.push(
    "updated_by_user_id = ?",
    "updated_at = CURRENT_TIMESTAMP(3)",
  );
  values.push(actorUserId);

  await pool.execute<ResultSetHeader>(
    `UPDATE site_settings SET ${assignments.join(", ")} WHERE id = 1`,
    values,
  );

  const [rows] = await pool.execute<SiteSettingsRow[]>(
    `SELECT id, site_name, slogan, phone, address, whatsapp, instagram, email,
            logo_media_asset_id, additional_media_asset_ids,
            updated_by_user_id, created_at, updated_at
       FROM site_settings
      WHERE id = 1
      LIMIT 1`,
  );

  return rows[0] ? mapSiteSettings(rows[0]) : null;
}

export async function createMediaAsset(
  metadata: CreateMediaAssetInput,
): Promise<MediaAssetRecord> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO media_assets (
       original_name, storage_name, storage_path, mime_type, extension,
       size_bytes, sha256, alt_text, uploaded_by_user_id
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      metadata.originalName,
      metadata.storageName,
      metadata.storagePath,
      metadata.mimeType,
      metadata.extension,
      metadata.sizeBytes,
      metadata.sha256,
      metadata.altText,
      metadata.uploadedByUserId,
    ],
  );

  const [rows] = await pool.execute<MediaAssetRow[]>(
    `SELECT id, original_name, storage_name, storage_path, mime_type, extension,
            size_bytes, sha256, alt_text, uploaded_by_user_id, created_at,
            deleted_at, deleted_by_user_id
       FROM media_assets
      WHERE id = ?
      LIMIT 1`,
    [result.insertId],
  );

  if (!rows[0]) {
    throw new Error("Created media asset could not be loaded");
  }

  return mapMediaAsset(rows[0]);
}

export async function listMediaAssets(
  options: MediaAssetListOptions = {},
): Promise<MediaAssetRecord[]> {
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 200);
  const offset = Math.max(options.offset ?? 0, 0);
  const deletedFilter = options.includeDeleted ? "" : "WHERE deleted_at IS NULL";

  const [rows] = await pool.query<MediaAssetRow[]>(
    `SELECT id, original_name, storage_name, storage_path, mime_type, extension,
            size_bytes, sha256, alt_text, uploaded_by_user_id, created_at,
            deleted_at, deleted_by_user_id
       FROM media_assets
       ${deletedFilter}
      ORDER BY id DESC
      LIMIT ? OFFSET ?`,
    [limit, offset],
  );

  return rows.map(mapMediaAsset);
}

export async function findMediaAssetById(
  id: number,
  includeDeleted = false,
): Promise<MediaAssetRecord | null> {
  const deletedFilter = includeDeleted ? "" : "AND deleted_at IS NULL";
  const [rows] = await pool.execute<MediaAssetRow[]>(
    `SELECT id, original_name, storage_name, storage_path, mime_type, extension,
            size_bytes, sha256, alt_text, uploaded_by_user_id, created_at,
            deleted_at, deleted_by_user_id
       FROM media_assets
      WHERE id = ?
        ${deletedFilter}
      LIMIT 1`,
    [id],
  );

  return rows[0] ? mapMediaAsset(rows[0]) : null;
}

export async function softDeleteMediaAsset(
  id: number,
  actorUserId: number,
): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE media_assets
        SET deleted_at = CURRENT_TIMESTAMP(3),
            deleted_by_user_id = ?
      WHERE id = ?
        AND deleted_at IS NULL`,
    [actorUserId, id],
  );

  return result.affectedRows === 1;
}

export async function listPublicActivities(): Promise<ActivityRecord[]> {
  const [rows] = await pool.query<ActivityRow[]>(
    `${publicActivitySelect}
      ORDER BY id DESC`,
  );

  return rows.map(mapActivity);
}

export async function findPublicActivityById(
  id: number,
): Promise<ActivityWithGroups | null> {
  const [activityRows] = await pool.execute<ActivityRow[]>(
    `${publicActivitySelect}
      AND id = ?
      LIMIT 1`,
    [id],
  );
  if (!activityRows[0]) {
    return null;
  }

  const [groupRows] = await pool.execute<GroupRow[]>(
    `${publicGroupSelect}
      AND g.activity_id = ?
      ORDER BY g.start_date IS NULL, g.start_date, g.id`,
    [id],
  );

  return {
    activity: mapActivity(activityRows[0]),
    groups: groupRows.map(mapGroup),
  };
}

export async function findPublicGroupById(
  id: number,
): Promise<{ group: GroupRecord; activity: ActivityRecord } | null> {
  const [groupRows] = await pool.execute<GroupRow[]>(
    `${publicGroupSelect}
      AND g.id = ?
      LIMIT 1`,
    [id],
  );
  if (!groupRows[0]) {
    return null;
  }

  const [activityRows] = await pool.execute<ActivityRow[]>(
    `${publicActivitySelect}
      AND id = ?
      LIMIT 1`,
    [groupRows[0].activity_id],
  );
  if (!activityRows[0]) {
    return null;
  }

  return {
    group: mapGroup(groupRows[0]),
    activity: mapActivity(activityRows[0]),
  };
}

export async function createPublicLead(
  input: CreatePublicLeadInput,
): Promise<PublicLeadRecord> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO public_leads (
       activity_id, group_id, full_name, phone, email, message, source_path
     ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      input.activityId,
      input.groupId,
      input.fullName,
      input.phone,
      input.email,
      input.message,
      input.sourcePath,
    ],
  );

  const [rows] = await pool.execute<PublicLeadRow[]>(
    `${publicLeadSelect}
      WHERE l.id = ?
      LIMIT 1`,
    [result.insertId],
  );

  if (!rows[0]) {
    throw new Error("Created public lead could not be loaded");
  }
  return mapPublicLead(rows[0]);
}

export async function listPublicLeads(
  options: PublicLeadListOptions = {},
): Promise<PublicLeadRecord[]> {
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 200);
  const offset = Math.max(options.offset ?? 0, 0);
  const values: Array<string | number> = [];
  const filters: string[] = [];

  if (options.status) {
    filters.push("l.status = ?");
    values.push(options.status);
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const [rows] = await pool.query<PublicLeadRow[]>(
    `${publicLeadSelect}
      ${where}
      ORDER BY l.id DESC
      LIMIT ? OFFSET ?`,
    [...values, limit, offset],
  );

  return rows.map(mapPublicLead);
}

export async function listAdminActivities(): Promise<ActivityWithGroups[]> {
  const [activityRows] = await pool.query<ActivityRow[]>(
    `${adminActivitySelect}
      ORDER BY id DESC`,
  );

  const [groupRows] = await pool.query<GroupRow[]>(
    `${adminGroupSelect}
      ORDER BY g.activity_id DESC, g.id DESC`,
  );

  return activityRows.map((activityRow) => ({
    activity: mapActivity(activityRow),
    groups: groupRows
      .filter((groupRow) => groupRow.activity_id === activityRow.id)
      .map(mapGroup),
  }));
}

export async function findAdminActivityById(
  id: number,
): Promise<ActivityWithGroups | null> {
  const [activityRows] = await pool.execute<ActivityRow[]>(
    `${adminActivitySelect}
      WHERE id = ?
      LIMIT 1`,
    [id],
  );
  if (!activityRows[0]) {
    return null;
  }

  const [groupRows] = await pool.execute<GroupRow[]>(
    `${adminGroupSelect}
      WHERE g.activity_id = ?
      ORDER BY g.id DESC`,
    [id],
  );

  return {
    activity: mapActivity(activityRows[0]),
    groups: groupRows.map(mapGroup),
  };
}

export async function createActivity(
  input: ActivityInput,
): Promise<ActivityRecord> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO activities (
       name, activity_type, audience, summary, description,
       image_media_asset_id, price_amount, publish_on_site, status,
       created_by_user_id
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.name,
      input.activityType,
      input.audience,
      input.summary,
      input.description,
      input.imageMediaAssetId,
      input.priceAmount,
      input.publishOnSite,
      input.status,
      input.createdByUserId ?? null,
    ],
  );

  const loaded = await findAdminActivityById(result.insertId);
  if (!loaded) {
    throw new Error("Created activity could not be loaded");
  }
  return loaded.activity;
}

export async function updateActivity(
  id: number,
  input: ActivityInput,
): Promise<ActivityRecord | null> {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE activities
        SET name = ?,
            activity_type = ?,
            audience = ?,
            summary = ?,
            description = ?,
            image_media_asset_id = ?,
            price_amount = ?,
            publish_on_site = ?,
            status = ?,
            updated_at = CURRENT_TIMESTAMP(3)
      WHERE id = ?`,
    [
      input.name,
      input.activityType,
      input.audience,
      input.summary,
      input.description,
      input.imageMediaAssetId,
      input.priceAmount,
      input.publishOnSite,
      input.status,
      id,
    ],
  );
  if (result.affectedRows !== 1) {
    return null;
  }
  return (await findAdminActivityById(id))?.activity ?? null;
}

export async function createGroup(input: GroupInput): Promise<GroupRecord> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO \`groups\` (
       activity_id, name, description, start_date, end_date, schedule_text,
       capacity, registration_status, publish_on_site, status, instructor_user_id
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.activityId,
      input.name,
      input.description,
      input.startDate,
      input.endDate,
      input.scheduleText,
      input.capacity,
      input.registrationStatus,
      input.publishOnSite,
      input.status,
      input.instructorUserId,
    ],
  );

  const [rows] = await pool.execute<GroupRow[]>(
    `${adminGroupSelect}
      WHERE g.id = ?
      LIMIT 1`,
    [result.insertId],
  );
  if (!rows[0]) {
    throw new Error("Created group could not be loaded");
  }
  return mapGroup(rows[0]);
}

export async function updateGroup(
  id: number,
  input: GroupInput,
): Promise<GroupRecord | null> {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE \`groups\`
        SET activity_id = ?,
            name = ?,
            description = ?,
            start_date = ?,
            end_date = ?,
            schedule_text = ?,
            capacity = ?,
            registration_status = ?,
            publish_on_site = ?,
            status = ?,
            instructor_user_id = ?,
            updated_at = CURRENT_TIMESTAMP(3)
      WHERE id = ?`,
    [
      input.activityId,
      input.name,
      input.description,
      input.startDate,
      input.endDate,
      input.scheduleText,
      input.capacity,
      input.registrationStatus,
      input.publishOnSite,
      input.status,
      input.instructorUserId,
      id,
    ],
  );
  if (result.affectedRows !== 1) {
    return null;
  }

  const [rows] = await pool.execute<GroupRow[]>(
    `${adminGroupSelect}
      WHERE g.id = ?
      LIMIT 1`,
    [id],
  );
  return rows[0] ? mapGroup(rows[0]) : null;
}
