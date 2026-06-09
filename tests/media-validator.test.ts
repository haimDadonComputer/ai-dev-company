import assert from "node:assert/strict";
import test from "node:test";
import type { Request } from "express";
import { validateUploadHeaders } from "../src/server/validators/media.js";

function requestWithHeaders(headers: Record<string, string>): Request {
  return {
    headers,
    is: (contentType: string) =>
      headers["content-type"] === contentType ? contentType : false
  } as unknown as Request;
}

test("upload headers decode Hebrew file name and alt text", () => {
  const result = validateUploadHeaders(requestWithHeaders({
    "content-type": "application/octet-stream",
    "x-file-name": encodeURIComponent("לוגו.png"),
    "x-alt-text": encodeURIComponent("לוגו האתר")
  }));

  assert.equal(result.originalName, "לוגו.png");
  assert.equal(result.altText, "לוגו האתר");
});

test("upload headers reject unsupported content type", () => {
  assert.throws(
    () => validateUploadHeaders(requestWithHeaders({
      "content-type": "image/png",
      "x-file-name": "logo.png"
    })),
    /application\/octet-stream/
  );
});
