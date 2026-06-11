import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

async function writeReferenceProfile(directory: string, overrides: Record<string, unknown> = {}) {
  const profilePath = join(directory, "profile.json");
  const reference = JSON.parse(
    await readFile("design-system/reference-design.json", "utf8")
  ) as {
    profile: Record<string, unknown>;
    dimensions: Record<string, Record<string, string>>;
  };
  const profile = {
    schemaVersion: 1,
    profileId: "base-infrastructure-reference",
    projectName: "תשתית בסיס",
    status: "reference",
    audience: "מפתחים שמקימים פרויקט חדש",
    visualConcept: "ממשק תפעולי ניטרלי שנועד להחלפה",
    differentiation: "פרופיל תשתית שאינו מיועד לפרודקשן",
    navigationPattern: reference.profile.navigationPattern,
    density: reference.profile.density,
    shapeLanguage: "soft-rectangular",
    typographyStrategy: "system-sans",
    colorStrategy: "neutral-blue-reference",
    motionStrategy: "minimal-functional",
    changedDimensions: [],
    referenceOnly: true,
    ...overrides
  };
  await writeFile(profilePath, JSON.stringify(profile), "utf8");
  return profilePath;
}

async function writeReferenceCss(directory: string, extra = "") {
  const cssPath = join(directory, "active.css");
  const reference = JSON.parse(
    await readFile("design-system/reference-design.json", "utf8")
  ) as {
    dimensions: Record<string, Record<string, string>>;
  };
  const fallbackTokens = {
    "--design-color-action-contrast": "#ffffff",
    "--design-color-focus": "#0ea5e9",
    "--design-color-success": "#16a34a",
    "--design-color-danger": "#dc2626",
    "--design-space-xs": "0.25rem",
    "--design-space-sm": "0.5rem",
    "--design-space-md": "1rem",
    "--design-space-lg": "1.5rem",
    "--design-space-xl": "2rem",
    "--design-content-max-width": "73.75rem",
    "--design-navigation-width": "15rem",
    "--design-header-height": "4.0625rem"
  };
  const declarations = [
    ...Object.values(reference.dimensions).flatMap((dimension) =>
      Object.entries(dimension)
    ),
    ...Object.entries(fallbackTokens)
  ]
    .map(([token, value]) => `  ${token}: ${value};`)
    .join("\n");
  await writeFile(cssPath, `:root {\n${declarations}\n}\n${extra}`, "utf8");
  return cssPath;
}

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

test("reference design is allowed only for infrastructure development", async () => {
  const directory = await mkdtemp(join(tmpdir(), "design-profile-"));
  const profilePath = await writeReferenceProfile(directory);
  const cssPath = await writeReferenceCss(directory);
  const result = runDesignCheck({
    NODE_ENV: "development",
    ALLOW_REFERENCE_DESIGN: "true",
    DESIGN_PROFILE_PATH: profilePath,
    DESIGN_CSS_PATH: cssPath
  });

  assert.equal(result.status, 0, result.stderr);
});

test("reference design is blocked in production", async () => {
  const directory = await mkdtemp(join(tmpdir(), "design-profile-"));
  const profilePath = await writeReferenceProfile(directory);
  const cssPath = await writeReferenceCss(directory);
  const result = runDesignCheck({
    NODE_ENV: "production",
    ALLOW_REFERENCE_DESIGN: "true",
    DESIGN_PROFILE_PATH: profilePath,
    DESIGN_CSS_PATH: cssPath
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /production builds cannot use/i);
});

test("custom metadata cannot bypass unchanged reference design", async () => {
  const directory = await mkdtemp(join(tmpdir(), "design-profile-"));
  const profilePath = await writeReferenceProfile(directory, {
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
  const cssPath = await writeReferenceCss(directory, "/* comment only */\n");

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
  const cssPath = join(directory, "active.css");
  const profilePath = await writeReferenceProfile(directory, {
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
  await writeReferenceCss(directory);
  let css = await readFile(cssPath, "utf8");
  css = css
    .replace("--design-font-size-display: 2rem", "--design-font-size-display: 2.4rem")
    .replace("--design-radius-control: 0.5rem", "--design-radius-control: 0")
    .replace("--design-shadow-surface: 0 10px 25px rgb(15 23 42 / 10%)", "--design-shadow-surface: none")
    .replace("--design-color-action: #2563eb", "--design-color-action: #7c2d12");

  await writeFile(cssPath, css, "utf8");

  const result = runDesignCheck({
    NODE_ENV: "development",
    ALLOW_REFERENCE_DESIGN: "false",
    DESIGN_PROFILE_PATH: profilePath,
    DESIGN_CSS_PATH: cssPath
  });

  assert.equal(result.status, 0, result.stderr);
});
