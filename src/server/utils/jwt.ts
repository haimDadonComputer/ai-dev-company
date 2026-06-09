import { createHmac, timingSafeEqual } from "node:crypto";
import { config } from "../config.js";

export type UserRole = "student" | "instructor" | "admin";
export type UserStatus = "active" | "inactive" | "archived";

interface JwtPayload {
  sub: number;
  role: UserRole;
  mustChangePassword: boolean;
  iat: number;
  exp: number;
}

function encode(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function sign(input: string): string {
  return createHmac("sha256", config.jwtSecret).update(input).digest("base64url");
}

export function createToken(
  userId: number,
  role: UserRole,
  mustChangePassword: boolean
): string {
  const now = Math.floor(Date.now() / 1000);
  const header = encode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = encode(JSON.stringify({
    sub: userId,
    role,
    mustChangePassword,
    iat: now,
    exp: now + config.jwtTtlSeconds
  } satisfies JwtPayload));
  const unsigned = `${header}.${payload}`;
  return `${unsigned}.${sign(unsigned)}`;
}

export function verifyToken(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [header, payload, signature] = parts;
  if (!header || !payload || !signature) {
    return null;
  }

  const unsigned = `${header}.${payload}`;
  const expected = Buffer.from(sign(unsigned));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as JwtPayload;
    const now = Math.floor(Date.now() / 1000);
    if (
      !Number.isInteger(parsed.sub) ||
      !["student", "instructor", "admin"].includes(parsed.role) ||
      typeof parsed.mustChangePassword !== "boolean" ||
      !Number.isInteger(parsed.exp) ||
      parsed.exp <= now
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
