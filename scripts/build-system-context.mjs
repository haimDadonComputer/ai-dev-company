import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { flattenSourcePaths, readStructured, sha256 } from "./context-utils.mjs";

const manifestPath = "shared-info/system_manifest.json";
const manifestContent = await readFile(resolve(manifestPath), "utf8");
const manifest = JSON.parse(manifestContent);

for (const [source, destination] of Object.entries(
  manifest.generatedArtifacts.qaMirrors
)) {
  await mkdir(dirname(resolve(destination)), { recursive: true });
  await copyFile(resolve(source), resolve(destination));
}

const sources = {};
for (const path of flattenSourcePaths(manifest)) {
  sources[path] = await readStructured(path);
}

const context = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  manifest: {
    path: manifestPath,
    hash: sha256(manifestContent),
    data: manifest
  },
  sources,
  summary: {
    roles: sources["agents/permissions/info/permissions.csv"].data.length,
    tables: sources["agents/db/info/tables-index.csv"].data.length,
    apis: sources["agents/api/info/api_list.csv"].data.length,
    components: sources["agents/components/info/components_list.csv"].data.length,
    features: sources["product/features.csv"].data.length,
    userStories: sources["product/user_stories.csv"].data.length,
    qaCases: sources["agents/qa/info/test_cases.csv"].data.length,
    openContradictions: sources["shared-info/contradictions.csv"].data.filter(
      (item) => item.status === "open"
    ).length
  }
};

await writeFile(
  resolve(manifest.generatedArtifacts.context),
  `${JSON.stringify(context, null, 2)}\n`,
  "utf8"
);

console.log(
  `System context built: ${Object.keys(sources).length} sources, ` +
    `${context.summary.apis} APIs, ${context.summary.tables} tables`
);
