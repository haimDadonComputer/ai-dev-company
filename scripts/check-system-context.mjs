import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve } from "node:path";
import {
  flattenSourcePaths,
  parseCsv,
  readStructured,
  sha256,
  splitList
} from "./context-utils.mjs";

const errors = [];
const warnings = [];
const manifestPath = "shared-info/system_manifest.json";
const manifestContent = await readFile(resolve(manifestPath), "utf8");
const manifest = JSON.parse(manifestContent);
const contextPath = manifest.generatedArtifacts.context;

async function exists(path) {
  try {
    await access(resolve(path), constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

for (const path of [
  "shared-info/manager_bootstrap.md",
  ...flattenSourcePaths(manifest)
]) {
  if (!(await exists(path))) {
    errors.push(`missing required source: ${path}`);
  }
}

for (const path of manifest.forbiddenDuplicateSources ?? []) {
  if (await exists(path)) {
    errors.push(`forbidden duplicate source exists: ${path}`);
  }
}

if (!(await exists(contextPath))) {
  errors.push(`missing generated context: ${contextPath}`);
} else {
  const context = JSON.parse(await readFile(resolve(contextPath), "utf8"));
  if (context.manifest?.hash !== sha256(manifestContent)) {
    errors.push("system_context.json was generated from an older manifest");
  }

  for (const path of flattenSourcePaths(manifest)) {
    if (!(await exists(path))) {
      continue;
    }
    const current = await readStructured(path);
    if (context.sources?.[path]?.hash !== current.hash) {
      errors.push(`stale context source: ${path}`);
    }
  }
}

for (const [source, mirror] of Object.entries(
  manifest.generatedArtifacts.qaMirrors
)) {
  if (!(await exists(source)) || !(await exists(mirror))) {
    errors.push(`missing QA source or mirror: ${source} -> ${mirror}`);
    continue;
  }
  const sourceContent = await readFile(resolve(source), "utf8");
  const mirrorContent = await readFile(resolve(mirror), "utf8");
  if (sha256(sourceContent) !== sha256(mirrorContent)) {
    errors.push(`QA mirror is not synchronized: ${mirror}`);
  }
}

const permissions = parseCsv(
  await readFile(resolve("agents/permissions/info/permissions.csv"), "utf8")
);
const apis = parseCsv(
  await readFile(resolve("agents/api/info/api_list.csv"), "utf8")
);
const components = parseCsv(
  await readFile(resolve("agents/components/info/components_list.csv"), "utf8")
);
const tables = parseCsv(
  await readFile(resolve("agents/db/info/tables-index.csv"), "utf8")
);
const environment = parseCsv(
  await readFile(resolve("shared-info/environment_contract.csv"), "utf8")
);

const roleNames = new Set(permissions.map((item) => item.role_name));
const apiNames = new Set(apis.map((item) => item.api_name));
const componentNames = new Set(components.map((item) => item.component_name));
const tableNames = new Set(tables.map((item) => item.table_name));

for (const api of apis) {
  for (const role of splitList(api.required_role)) {
    if (!roleNames.has(role)) {
      errors.push(`API ${api.api_name} references unknown role ${role}`);
    }
  }
  for (const table of splitList(api.related_db_tables)) {
    if (!tableNames.has(table)) {
      errors.push(`API ${api.api_name} references unknown table ${table}`);
    }
  }
}

for (const component of components) {
  for (const role of splitList(component.visible_to)) {
    if (!roleNames.has(role)) {
      errors.push(
        `component ${component.component_name} references unknown role ${role}`
      );
    }
  }
  for (const api of splitList(component.api_used)) {
    if (!apiNames.has(api)) {
      errors.push(
        `component ${component.component_name} references unknown API ${api}`
      );
    }
  }
}

for (const permission of permissions) {
  for (const api of splitList(permission.allowed_api)) {
    if (!apiNames.has(api)) {
      errors.push(`role ${permission.role_name} references unknown API ${api}`);
    }
  }
  for (const component of splitList(permission.allowed_components)) {
    if (!componentNames.has(component)) {
      errors.push(
        `role ${permission.role_name} references unknown component ${component}`
      );
    }
  }
}

const exampleKeys = new Set(
  (await readFile(resolve(".env.example"), "utf8"))
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split("=")[0])
);
for (const variable of environment.filter((item) => item.required === "yes")) {
  if (!exampleKeys.has(variable.name)) {
    errors.push(`required environment variable missing from .env.example: ${variable.name}`);
  }
}

const contradictions = parseCsv(
  await readFile(resolve("shared-info/contradictions.csv"), "utf8")
);
for (const contradiction of contradictions.filter(
  (item) =>
    item.status === "open" &&
    ["High", "Critical"].includes(item.severity)
)) {
  warnings.push(
    `OPEN ${contradiction.severity}: ${contradiction.problem}`
  );
}

if (warnings.length > 0) {
  console.warn("System context warnings:");
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}

if (errors.length > 0) {
  console.error("System context validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  console.error("Run npm run context:build after correcting the sources.");
  process.exit(1);
}

console.log(
  `System context valid: ${roleNames.size} roles, ${tableNames.size} tables, ` +
    `${apiNames.size} APIs, ${componentNames.size} components`
);
