import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { promisify } from "node:util";
import {
  Connection,
  createConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";

interface ExistingUserRow extends RowDataPacket {
  id: number;
}

interface CountRow extends RowDataPacket {
  count: number;
}

if (existsSync(".env")) {
  loadEnvFile(".env");
}

const scrypt = promisify(scryptCallback);

function requireEnvironmentVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function validateDatabaseName(databaseName: string): string {
  if (!/^[A-Za-z0-9_]+$/.test(databaseName)) {
    throw new Error("DB_NAME may contain only letters, numbers, and underscores");
  }
  return databaseName;
}

async function columnExists(
  connection: Connection,
  databaseName: string,
  tableName: string,
  columnName: string,
): Promise<boolean> {
  const [rows] = await connection.execute<CountRow[]>(
    `SELECT COUNT(*) AS count
       FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?`,
    [databaseName, tableName, columnName],
  );

  return Number(rows[0]?.count ?? 0) > 0;
}

async function indexExists(
  connection: Connection,
  databaseName: string,
  tableName: string,
  indexName: string,
): Promise<boolean> {
  const [rows] = await connection.execute<CountRow[]>(
    `SELECT COUNT(*) AS count
       FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
        AND INDEX_NAME = ?`,
    [databaseName, tableName, indexName],
  );

  return Number(rows[0]?.count ?? 0) > 0;
}

async function addColumnIfMissing(
  connection: Connection,
  databaseName: string,
  tableName: string,
  columnName: string,
  definition: string,
): Promise<void> {
  if (await columnExists(connection, databaseName, tableName, columnName)) {
    return;
  }

  await connection.query(
    `ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${definition}`,
  );
}

async function addIndexIfMissing(
  connection: Connection,
  databaseName: string,
  tableName: string,
  indexName: string,
  definition: string,
): Promise<void> {
  if (await indexExists(connection, databaseName, tableName, indexName)) {
    return;
  }

  await connection.query(
    `ALTER TABLE \`${tableName}\` ADD INDEX \`${indexName}\` ${definition}`,
  );
}

async function start(): Promise<void> {
  const databaseName = validateDatabaseName(
    requireEnvironmentVariable("DB_NAME"),
  );
  const adminUsername = requireEnvironmentVariable("ADMIN_INITIAL_USERNAME");
  const adminPassword = requireEnvironmentVariable("ADMIN_INITIAL_PASSWORD");

  const connection: Connection = await createConnection({
    host: requireEnvironmentVariable("DB_HOST"),
    port: Number(process.env.DB_PORT ?? "3306"),
    user: requireEnvironmentVariable("DB_USER"),
    password: process.env.DB_PASSWORD ?? "",
    charset: "utf8mb4",
    timezone: "Z",
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${databaseName}\`
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    await connection.query(`USE \`${databaseName}\``);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        username VARCHAR(191) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        password_salt VARCHAR(255) NOT NULL,
        role_name VARCHAR(50) NOT NULL DEFAULT 'admin',
        first_name VARCHAR(100) NOT NULL DEFAULT '',
        last_name VARCHAR(100) NOT NULL DEFAULT '',
        phone VARCHAR(50) NOT NULL DEFAULT '',
        email VARCHAR(254) NOT NULL DEFAULT '',
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
        notes TEXT NULL,
        last_login_at DATETIME(3) NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
          ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY uq_users_username (username),
        KEY idx_users_role_name (role_name),
        KEY idx_users_status (status),
        KEY idx_users_is_active (is_active),
        CONSTRAINT chk_users_role_name
          CHECK (role_name IN ('student', 'instructor', 'admin')),
        CONSTRAINT chk_users_status
          CHECK (status IN ('active', 'inactive', 'archived'))
      ) ENGINE=InnoDB
        DEFAULT CHARSET=utf8mb4
        COLLATE=utf8mb4_unicode_ci
    `);

    await addColumnIfMissing(
      connection,
      databaseName,
      "users",
      "first_name",
      "VARCHAR(100) NOT NULL DEFAULT ''",
    );
    await addColumnIfMissing(
      connection,
      databaseName,
      "users",
      "last_name",
      "VARCHAR(100) NOT NULL DEFAULT ''",
    );
    await addColumnIfMissing(
      connection,
      databaseName,
      "users",
      "phone",
      "VARCHAR(50) NOT NULL DEFAULT ''",
    );
    await addColumnIfMissing(
      connection,
      databaseName,
      "users",
      "email",
      "VARCHAR(254) NOT NULL DEFAULT ''",
    );
    await addColumnIfMissing(
      connection,
      databaseName,
      "users",
      "status",
      "VARCHAR(20) NOT NULL DEFAULT 'active'",
    );
    await addColumnIfMissing(
      connection,
      databaseName,
      "users",
      "notes",
      "TEXT NULL",
    );
    await addIndexIfMissing(
      connection,
      databaseName,
      "users",
      "idx_users_status",
      "(status)",
    );

    await connection.query(`
      CREATE TABLE IF NOT EXISTS students (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        national_id VARCHAR(30) NULL,
        birth_date DATE NULL,
        full_address VARCHAR(500) NOT NULL DEFAULT '',
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
          ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY uq_students_user_id (user_id),
        UNIQUE KEY uq_students_national_id (national_id),
        CONSTRAINT fk_students_user
          FOREIGN KEY (user_id) REFERENCES users (id)
          ON UPDATE RESTRICT ON DELETE RESTRICT
      ) ENGINE=InnoDB
        DEFAULT CHARSET=utf8mb4
        COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS instructors (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        expertise_areas TEXT NULL,
        biography TEXT NULL,
        resume_file_id BIGINT UNSIGNED NULL,
        certification_file_ids JSON NULL,
        notes TEXT NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
          ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY uq_instructors_user_id (user_id),
        CONSTRAINT fk_instructors_user
          FOREIGN KEY (user_id) REFERENCES users (id)
          ON UPDATE RESTRICT ON DELETE RESTRICT
      ) ENGINE=InnoDB
        DEFAULT CHARSET=utf8mb4
        COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS media_assets (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        original_name VARCHAR(255) NOT NULL,
        storage_name VARCHAR(255) NOT NULL,
        storage_path VARCHAR(512) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        extension VARCHAR(20) NOT NULL,
        size_bytes BIGINT UNSIGNED NOT NULL,
        sha256 CHAR(64) NOT NULL,
        alt_text VARCHAR(500) NULL,
        uploaded_by_user_id BIGINT UNSIGNED NOT NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        deleted_at DATETIME(3) NULL,
        deleted_by_user_id BIGINT UNSIGNED NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uq_media_assets_storage_name (storage_name),
        UNIQUE KEY uq_media_assets_storage_path (storage_path),
        KEY idx_media_assets_active_created (deleted_at, created_at),
        KEY idx_media_assets_uploaded_by (uploaded_by_user_id),
        KEY idx_media_assets_deleted_by (deleted_by_user_id),
        CONSTRAINT fk_media_assets_uploaded_by
          FOREIGN KEY (uploaded_by_user_id) REFERENCES users (id)
          ON UPDATE RESTRICT ON DELETE RESTRICT,
        CONSTRAINT fk_media_assets_deleted_by
          FOREIGN KEY (deleted_by_user_id) REFERENCES users (id)
          ON UPDATE RESTRICT ON DELETE RESTRICT,
        CONSTRAINT chk_media_assets_size
          CHECK (size_bytes BETWEEN 1 AND 5242880),
        CONSTRAINT chk_media_assets_mime_type
          CHECK (mime_type IN ('image/png', 'image/jpeg', 'image/webp')),
        CONSTRAINT chk_media_assets_extension
          CHECK (extension IN ('png', 'jpg', 'jpeg', 'webp'))
      ) ENGINE=InnoDB
        DEFAULT CHARSET=utf8mb4
        COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(191) NOT NULL,
        activity_type VARCHAR(100) NOT NULL DEFAULT '',
        audience VARCHAR(255) NOT NULL DEFAULT '',
        summary VARCHAR(500) NOT NULL DEFAULT '',
        description TEXT NULL,
        image_media_asset_id BIGINT UNSIGNED NULL,
        price_amount DECIMAL(10,2) NULL,
        publish_on_site BOOLEAN NOT NULL DEFAULT FALSE,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        created_by_user_id BIGINT UNSIGNED NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
          ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        KEY idx_activities_public (publish_on_site, status, id),
        KEY idx_activities_image (image_media_asset_id),
        KEY idx_activities_created_by (created_by_user_id),
        CONSTRAINT fk_activities_image
          FOREIGN KEY (image_media_asset_id) REFERENCES media_assets (id)
          ON UPDATE RESTRICT ON DELETE SET NULL,
        CONSTRAINT fk_activities_created_by
          FOREIGN KEY (created_by_user_id) REFERENCES users (id)
          ON UPDATE RESTRICT ON DELETE SET NULL,
        CONSTRAINT chk_activities_status
          CHECK (status IN ('active', 'inactive', 'archived'))
      ) ENGINE=InnoDB
        DEFAULT CHARSET=utf8mb4
        COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`groups\` (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        activity_id BIGINT UNSIGNED NOT NULL,
        name VARCHAR(191) NOT NULL,
        description TEXT NULL,
        start_date DATE NULL,
        end_date DATE NULL,
        schedule_text VARCHAR(500) NOT NULL DEFAULT '',
        capacity INT UNSIGNED NULL,
        registration_status VARCHAR(20) NOT NULL DEFAULT 'open',
        publish_on_site BOOLEAN NOT NULL DEFAULT FALSE,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        instructor_user_id BIGINT UNSIGNED NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
          ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        KEY idx_groups_activity_public (activity_id, publish_on_site, status),
        KEY idx_groups_instructor (instructor_user_id),
        CONSTRAINT fk_groups_activity
          FOREIGN KEY (activity_id) REFERENCES activities (id)
          ON UPDATE RESTRICT ON DELETE RESTRICT,
        CONSTRAINT fk_groups_instructor
          FOREIGN KEY (instructor_user_id) REFERENCES users (id)
          ON UPDATE RESTRICT ON DELETE SET NULL,
        CONSTRAINT chk_groups_status
          CHECK (status IN ('active', 'inactive', 'archived')),
        CONSTRAINT chk_groups_registration_status
          CHECK (registration_status IN ('open', 'closed', 'full', 'archived'))
      ) ENGINE=InnoDB
        DEFAULT CHARSET=utf8mb4
        COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS public_leads (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        activity_id BIGINT UNSIGNED NULL,
        group_id BIGINT UNSIGNED NULL,
        full_name VARCHAR(191) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(254) NULL,
        message TEXT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'new',
        source_path VARCHAR(255) NOT NULL DEFAULT '',
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
          ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        KEY idx_public_leads_created (created_at),
        KEY idx_public_leads_status (status, created_at),
        KEY idx_public_leads_activity (activity_id),
        KEY idx_public_leads_group (group_id),
        CONSTRAINT fk_public_leads_activity
          FOREIGN KEY (activity_id) REFERENCES activities (id)
          ON UPDATE RESTRICT ON DELETE SET NULL,
        CONSTRAINT fk_public_leads_group
          FOREIGN KEY (group_id) REFERENCES \`groups\` (id)
          ON UPDATE RESTRICT ON DELETE SET NULL,
        CONSTRAINT chk_public_leads_status
          CHECK (status IN ('new', 'contacted', 'closed', 'archived'))
      ) ENGINE=InnoDB
        DEFAULT CHARSET=utf8mb4
        COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id TINYINT UNSIGNED NOT NULL DEFAULT 1,
        site_name VARCHAR(191) NOT NULL DEFAULT '',
        slogan VARCHAR(255) NOT NULL DEFAULT '',
        phone VARCHAR(50) NOT NULL DEFAULT '',
        address VARCHAR(500) NOT NULL DEFAULT '',
        whatsapp VARCHAR(100) NOT NULL DEFAULT '',
        instagram VARCHAR(255) NOT NULL DEFAULT '',
        email VARCHAR(254) NOT NULL DEFAULT '',
        logo_media_asset_id BIGINT UNSIGNED NULL,
        additional_media_asset_ids JSON NULL,
        updated_by_user_id BIGINT UNSIGNED NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
          ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        KEY idx_site_settings_logo (logo_media_asset_id),
        KEY idx_site_settings_updated_by (updated_by_user_id),
        CONSTRAINT chk_site_settings_singleton CHECK (id = 1),
        CONSTRAINT fk_site_settings_logo
          FOREIGN KEY (logo_media_asset_id) REFERENCES media_assets (id)
          ON UPDATE RESTRICT ON DELETE SET NULL,
        CONSTRAINT fk_site_settings_updated_by
          FOREIGN KEY (updated_by_user_id) REFERENCES users (id)
          ON UPDATE RESTRICT ON DELETE RESTRICT
      ) ENGINE=InnoDB
        DEFAULT CHARSET=utf8mb4
        COLLATE=utf8mb4_unicode_ci
    `);

    const [existingUsers] = await connection.execute<ExistingUserRow[]>(
      "SELECT id FROM users WHERE username = ? LIMIT 1",
      [adminUsername],
    );

    if (!existingUsers[0]) {
      const salt = randomBytes(32);
      const derivedKey = (await scrypt(adminPassword, salt, 64)) as Buffer;

      await connection.execute<ResultSetHeader>(
        `INSERT INTO users (
           username, password_hash, password_salt, role_name,
           first_name, last_name, status, is_active, must_change_password
         ) VALUES (?, ?, ?, 'admin', 'מנהל', 'מערכת', 'active', TRUE, TRUE)`,
        [
          adminUsername,
          derivedKey.toString("hex"),
          salt.toString("hex"),
        ],
      );
    }

    await connection.execute<ResultSetHeader>(
      `INSERT INTO site_settings (id)
       VALUES (1)
       ON DUPLICATE KEY UPDATE id = id`,
    );
  } finally {
    await connection.end();
  }
}

start().catch((error: unknown) => {
  console.error("Database initialization failed", error);
  process.exitCode = 1;
});
