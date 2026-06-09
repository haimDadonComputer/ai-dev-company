import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

export function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

export function parseCsv(content) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    if (character === '"') {
      if (quoted && content[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && content[index + 1] === "\n") {
        index += 1;
      }
      row.push(field);
      field = "";
      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }
      row = [];
    } else {
      field += character;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0];
  return rows.slice(1).map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]))
  );
}

export async function readStructured(path) {
  const absolutePath = resolve(path);
  const content = await readFile(absolutePath, "utf8");
  const extension = extname(path).toLowerCase();
  let data = content;
  if (extension === ".csv") {
    data = parseCsv(content);
  } else if (extension === ".json") {
    data = JSON.parse(content);
  }

  return {
    path,
    hash: sha256(content),
    data
  };
}

export function flattenSourcePaths(manifest) {
  return Object.values(manifest.sourcesOfTruth).flat();
}

export function splitList(value) {
  if (!value || value === "none") {
    return [];
  }
  return value
    .split(/[|;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
