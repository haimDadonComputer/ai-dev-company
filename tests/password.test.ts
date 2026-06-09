import assert from "node:assert/strict";
import test from "node:test";
import {
  hashPassword,
  validateNewPassword,
  verifyPassword
} from "../src/server/utils/password.js";

test("password hashing creates a verifiable salted digest", async () => {
  const first = await hashPassword("StrongPass123");
  const second = await hashPassword("StrongPass123");

  assert.notEqual(first.salt, second.salt);
  assert.notEqual(first.hash, second.hash);
  assert.equal(
    await verifyPassword("StrongPass123", first.hash, first.salt),
    true
  );
  assert.equal(
    await verifyPassword("WrongPass123", first.hash, first.salt),
    false
  );
});

test("new password policy rejects short or single-category passwords", () => {
  assert.ok(validateNewPassword("123123"));
  assert.ok(validateNewPassword("onlyletters"));
  assert.equal(validateNewPassword("SecurePass123"), null);
});
