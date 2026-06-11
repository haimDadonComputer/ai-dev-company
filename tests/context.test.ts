import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("system manifest declares the mandatory manager bootstrap", async () => {
  const manifest = JSON.parse(
    await readFile("shared-info/system_manifest.json", "utf8")
  ) as {
    bootstrap?: {
      firstFile?: string;
      requiredBeforeEveryTask?: boolean;
      validationCommand?: string;
    };
    sourcesOfTruth?: Record<string, string[]>;
  };

  assert.equal(
    manifest.bootstrap?.firstFile,
    "shared-info/manager_bootstrap.md"
  );
  assert.equal(manifest.bootstrap?.requiredBeforeEveryTask, true);
  assert.equal(manifest.bootstrap?.validationCommand, "npm run context:check");
  assert.ok(manifest.sourcesOfTruth?.permissions?.length);
  assert.ok(manifest.sourcesOfTruth?.database?.length);
  assert.ok(manifest.sourcesOfTruth?.api?.length);
  assert.ok(manifest.sourcesOfTruth?.components?.length);
});

test("generated system context contains the core contracts", async () => {
  const context = JSON.parse(
    await readFile("shared-info/system_context.json", "utf8")
  ) as {
    summary?: {
      roles?: number;
      tables?: number;
      apis?: number;
      components?: number;
    };
    sources?: Record<string, unknown>;
  };

  assert.equal(context.summary?.roles, 4);
  assert.equal(context.summary?.tables, 8);
  assert.equal(context.summary?.apis, 27);
  assert.equal(context.summary?.components, 16);
  assert.ok(context.sources?.["shared-info/contracts.csv"]);
  assert.ok(context.sources?.["shared-info/project_status.json"]);
});

test("context validator accepts the current sources of truth", () => {
  const result = spawnSync(
    process.execPath,
    ["scripts/check-system-context.mjs"],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      env: process.env
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /System context valid/);
});
