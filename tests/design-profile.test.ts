import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

function runDesignCheck(environment: NodeJS.ProcessEnv) {
  return spawnSync(
    process.execPath,
    ["scripts/check-design-profile.mjs"],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      env: {
        ...process.env,
        ...environment
      }
    }
  );
}

test("reference design is allowed only for infrastructure development", () => {
  const result = runDesignCheck({
    NODE_ENV: "development",
    ALLOW_REFERENCE_DESIGN: "true"
  });

  assert.equal(result.status, 0, result.stderr);
});

test("reference design is blocked in production", () => {
  const result = runDesignCheck({
    NODE_ENV: "production",
    ALLOW_REFERENCE_DESIGN: "true"
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /production builds cannot use/i);
});

test("custom metadata cannot bypass unchanged reference design", async () => {
  const directory = await mkdtemp(join(tmpdir(), "design-profile-"));
  const profilePath = join(directory, "profile.json");
  const cssPath = join(directory, "active.css");
  const profile = JSON.parse(
    await readFile("design-system/project-profile.json", "utf8")
  ) as Record<string, unknown>;

  Object.assign(profile, {
    profileId: "custom-project",
    status: "custom",
    referenceOnly: false,
    changedDimensions: [
      "typography",
      "shape-language",
      "surfaces",
      "color-hierarchy"
    ]
  });
  await writeFile(profilePath, JSON.stringify(profile), "utf8");
  await writeFile(
    cssPath,
    `${await readFile("src/design/active-profile.css", "utf8")}\n/* comment only */\n`,
    "utf8"
  );

  const result = runDesignCheck({
    NODE_ENV: "development",
    ALLOW_REFERENCE_DESIGN: "false",
    DESIGN_PROFILE_PATH: profilePath,
    DESIGN_CSS_PATH: cssPath
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /only 0 design dimensions differ/i);
  assert.match(result.stderr, /declared dimension has not changed/i);
});

test("custom profile passes after four semantic dimensions change", async () => {
  const directory = await mkdtemp(join(tmpdir(), "design-profile-"));
  const profilePath = join(directory, "profile.json");
  const cssPath = join(directory, "active.css");
  const profile = JSON.parse(
    await readFile("design-system/project-profile.json", "utf8")
  ) as Record<string, unknown>;
  let css = await readFile("src/design/active-profile.css", "utf8");

  Object.assign(profile, {
    profileId: "editorial-project",
    status: "custom",
    referenceOnly: false,
    changedDimensions: [
      "typography",
      "shape-language",
      "surfaces",
      "color-hierarchy"
    ]
  });
  css = css
    .replace("--design-font-size-display: 2rem", "--design-font-size-display: 2.4rem")
    .replace("--design-radius-control: 0.5rem", "--design-radius-control: 0")
    .replace("--design-shadow-surface: 0 10px 25px rgb(15 23 42 / 10%)", "--design-shadow-surface: none")
    .replace("--design-color-action: #2563eb", "--design-color-action: #7c2d12");

  await writeFile(profilePath, JSON.stringify(profile), "utf8");
  await writeFile(cssPath, css, "utf8");

  const result = runDesignCheck({
    NODE_ENV: "development",
    ALLOW_REFERENCE_DESIGN: "false",
    DESIGN_PROFILE_PATH: profilePath,
    DESIGN_CSS_PATH: cssPath
  });

  assert.equal(result.status, 0, result.stderr);
});
