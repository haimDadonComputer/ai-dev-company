import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const profilePath = resolve(
  process.env.DESIGN_PROFILE_PATH ?? "design-system/project-profile.json"
);
const referencePath = resolve(
  process.env.DESIGN_REFERENCE_PATH ?? "design-system/reference-design.json"
);
const cssPath = resolve(
  process.env.DESIGN_CSS_PATH ?? "src/design/active-profile.css"
);
const profile = JSON.parse(await readFile(profilePath, "utf8"));
const reference = JSON.parse(await readFile(referencePath, "utf8"));
const css = await readFile(cssPath, "utf8");

const requiredTextFields = [
  "profileId",
  "projectName",
  "audience",
  "visualConcept",
  "differentiation",
  "shapeLanguage",
  "typographyStrategy",
  "colorStrategy",
  "motionStrategy"
];
const navigationPatterns = new Set(["sidebar", "topbar", "rail"]);
const densities = new Set(["compact", "comfortable", "spacious"]);
const designDimensions = new Set([
  "typography",
  "navigation",
  "density",
  "shape-language",
  "surfaces",
  "auth-composition",
  "color-hierarchy",
  "motion"
]);
const requiredTokens = [
  "--design-font-body",
  "--design-font-heading",
  "--design-font-size-display",
  "--design-color-action",
  "--design-color-action-hover",
  "--design-color-action-contrast",
  "--design-color-background",
  "--design-color-surface",
  "--design-color-text",
  "--design-color-muted",
  "--design-color-border",
  "--design-color-focus",
  "--design-color-success",
  "--design-color-danger",
  "--design-color-selected-surface",
  "--design-auth-background",
  "--design-space-xs",
  "--design-space-sm",
  "--design-space-md",
  "--design-space-lg",
  "--design-space-xl",
  "--design-radius-control",
  "--design-radius-surface",
  "--design-shadow-surface",
  "--design-content-max-width",
  "--design-navigation-width",
  "--design-header-height",
  "--design-motion-duration",
  "--design-motion-easing"
];

const errors = [];
const tokenValues = new Map(
  [...css.matchAll(/(--design-[a-z0-9-]+)\s*:\s*([^;]+);/gi)].map(
    ([, token, value]) => [token, normalize(value)]
  )
);

function normalize(value) {
  return String(value).replace(/\s+/g, " ").trim();
}

function dimensionChanged(dimension) {
  if (dimension === "navigation") {
    return profile.navigationPattern !== reference.profile.navigationPattern;
  }
  if (dimension === "density") {
    return profile.density !== reference.profile.density;
  }

  const baseline = reference.dimensions[dimension];
  if (!baseline) {
    return false;
  }
  return Object.entries(baseline).some(
    ([token, value]) => tokenValues.get(token) !== normalize(value)
  );
}

if (profile.schemaVersion !== 1) {
  errors.push("schemaVersion must be 1");
}
for (const field of requiredTextFields) {
  if (typeof profile[field] !== "string" || profile[field].trim().length < 3) {
    errors.push(`${field} must contain a meaningful value`);
  }
}
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(profile.profileId ?? "")) {
  errors.push("profileId must use kebab-case");
}
if (!navigationPatterns.has(profile.navigationPattern)) {
  errors.push("navigationPattern must be sidebar, topbar or rail");
}
if (!densities.has(profile.density)) {
  errors.push("density must be compact, comfortable or spacious");
}
for (const token of requiredTokens) {
  if (!tokenValues.has(token)) {
    errors.push(`missing design token: ${token}`);
  }
}

const isReference =
  profile.referenceOnly === true ||
  profile.status === "reference" ||
  profile.profileId === "base-infrastructure-reference";
const allowReference = process.env.ALLOW_REFERENCE_DESIGN === "true";
if (process.env.NODE_ENV === "production" && isReference) {
  errors.push("production builds cannot use the infrastructure reference profile");
} else if (isReference && !allowReference) {
  errors.push(
    "reference profile is active; customize the profile or set ALLOW_REFERENCE_DESIGN=true for infrastructure development only"
  );
}

if (!isReference) {
  const declaredDimensions = Array.isArray(profile.changedDimensions)
    ? [...new Set(profile.changedDimensions)]
    : [];
  if (
    declaredDimensions.length < 4 ||
    !declaredDimensions.every((item) => designDimensions.has(item))
  ) {
    errors.push(
      "custom profiles must declare at least four unique valid changedDimensions"
    );
  }
  const actualDimensions = [...designDimensions].filter(dimensionChanged);
  if (actualDimensions.length < 4) {
    errors.push(
      `only ${actualDimensions.length} design dimensions differ from the reference; at least four are required`
    );
  }
  for (const dimension of declaredDimensions) {
    if (designDimensions.has(dimension) && !dimensionChanged(dimension)) {
      errors.push(`declared dimension has not changed: ${dimension}`);
    }
  }
}

if (errors.length > 0) {
  console.error("Design profile validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Design profile valid: ${profile.profileId}`);
