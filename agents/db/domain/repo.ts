import {
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
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
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

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  password_hash: string;
  password_salt: string;
  role_name: string;
  is_active: number;
  must_change_password: number;
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
    isActive: Boolean(row.is_active),
    mustChangePassword: Boolean(row.must_change_password),
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

export async function findUserByUsername(
  username: string,
): Promise<UserRecord | null> {
  const [rows] = await pool.execute<UserRow[]>(
    `SELECT id, username, password_hash, password_salt, role_name, is_active,
            must_change_password, last_login_at, created_at, updated_at
       FROM users
      WHERE username = ?
      LIMIT 1`,
    [username],
  );

  return rows[0] ? mapUser(rows[0]) : null;
}

export async function findUserById(id: number): Promise<UserRecord | null> {
  const [rows] = await pool.execute<UserRow[]>(
    `SELECT id, username, password_hash, password_salt, role_name, is_active,
            must_change_password, last_login_at, created_at, updated_at
       FROM users
      WHERE id = ?
      LIMIT 1`,
    [id],
  );

  return rows[0] ? mapUser(rows[0]) : null;
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
