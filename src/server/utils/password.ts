import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export interface PasswordDigest {
  hash: string;
  salt: string;
}

export async function hashPassword(password: string): Promise<PasswordDigest> {
  const salt = randomBytes(16);
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return {
    hash: derivedKey.toString("hex"),
    salt: salt.toString("hex")
  };
}

export async function verifyPassword(
  password: string,
  storedHash: string,
  storedSalt: string
): Promise<boolean> {
  try {
    const expected = Buffer.from(storedHash, "hex");
    const actual = (await scrypt(
      password,
      Buffer.from(storedSalt, "hex"),
      expected.length
    )) as Buffer;
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

export function validateNewPassword(password: string): string | null {
  if (password.length < 10) {
    return "הסיסמה חייבת להכיל לפחות 10 תווים";
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "הסיסמה חייבת לכלול אותיות ומספרים";
  }
  return null;
}
