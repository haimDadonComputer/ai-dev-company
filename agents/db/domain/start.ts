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
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
        last_login_at DATETIME(3) NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
          ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY uq_users_username (username),
        KEY idx_users_role_name (role_name),
        KEY idx_users_is_active (is_active)
      ) ENGINE=InnoDB
        DEFAULT CHARSET=utf8mb4
        COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS media_assets (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        original_name VARCHAR(255) NOT NULL,
        storage_name VARCHAR(255) NOT NULL,
        storage_path VARCHAR(1024) NOT NULL,
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
           is_active, must_change_password
         ) VALUES (?, ?, ?, 'admin', TRUE, TRUE)`,
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
