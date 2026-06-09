import assert from "node:assert/strict";
import test from "node:test";
import { createToken, verifyToken } from "../src/server/utils/jwt.js";

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

test("JWT round trip supports all CRM user roles", () => {
  for (const role of ["student", "instructor", "admin"] as const) {
    const token = createToken(12, role, false);
    const payload = verifyToken(token);

    assert.equal(payload?.sub, 12);
    assert.equal(payload?.role, role);
    assert.equal(payload?.mustChangePassword, false);
  }
});
