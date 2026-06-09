import { resolve } from "node:path";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function positiveInteger(name: string, fallback?: number): number {
  const raw = process.env[name]?.trim();
  if (!raw && fallback !== undefined) {
    return fallback;
  }

  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Environment variable ${name} must be a positive integer`);
  }
  return value;
}

const nodeEnv = process.env.NODE_ENV?.trim() || "development";

export const config = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  port: positiveInteger("PORT", 3000),
  appOrigin: required("APP_ORIGIN"),
  jwtSecret: required("JWT_SECRET"),
  jwtTtlSeconds: positiveInteger("JWT_TTL_SECONDS", 28800),
  uploadDir: resolve(process.env.UPLOAD_DIR?.trim() || "storage/uploads"),
  maxUploadBytes: positiveInteger("MAX_UPLOAD_BYTES", 5 * 1024 * 1024)
};

if (Buffer.byteLength(config.jwtSecret) < 32) {
  throw new Error("JWT_SECRET must contain at least 32 bytes");
}

if (config.maxUploadBytes > 5 * 1024 * 1024) {
  throw new Error("MAX_UPLOAD_BYTES cannot exceed 5MB");
}
