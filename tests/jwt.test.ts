import assert from "node:assert/strict";
import test from "node:test";

process.env.APP_ORIGIN ??= "http://localhost:3000";
process.env.JWT_SECRET ??= "test-secret-with-at-least-32-characters";
process.env.JWT_TTL_SECONDS ??= "28800";
process.env.PORT ??= "3000";
process.env.DB_HOST ??= "127.0.0.1";
process.env.DB_PORT ??= "3306";
process.env.DB_USER ??= "root";
process.env.DB_PASSWORD ??= "test";
process.env.DB_NAME ??= "ai_dev_company_base";
process.env.UPLOAD_DIR ??= "storage/uploads";
process.env.MAX_UPLOAD_BYTES ??= "5242880";

const { createToken, verifyToken } = await import("../src/server/utils/jwt.js");

test("JWT round trip preserves the authenticated admin claims", () => {
  const token = createToken(7, "admin", true);
  const payload = verifyToken(token);

  assert.equal(payload?.sub, 7);
  assert.equal(payload?.role, "admin");
  assert.equal(payload?.mustChangePassword, true);
});

test("JWT verification rejects a modified signature", () => {
  const token = createToken(7, "admin", false);
  const modified = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;

  assert.equal(verifyToken(modified), null);
});
