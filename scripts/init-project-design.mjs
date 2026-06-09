import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).map((item) => {
    const separator = item.indexOf("=");
    if (!item.startsWith("--") || separator < 3) {
      return ["", ""];
    }
    return [item.slice(2, separator), item.slice(separator + 1)];
  })
);

const required = [
  "id",
  "name",
  "audience",
  "concept",
  "differentiation",
  "navigation",
  "density",
  "shape",
  "typography",
  "colors",
  "motion",
  "dimensions"
];
const missing = required.filter((key) => !args[key]?.trim());

if (missing.length > 0) {
  console.error(`Missing arguments: ${missing.join(", ")}`);
  console.error(
    "See design-system/project_design_checklist.md for the required design brief."
  );
  process.exit(1);
}

const profilePath = resolve("design-system/project-profile.json");
const profile = JSON.parse(await readFile(profilePath, "utf8"));

Object.assign(profile, {
  profileId: args.id,
  projectName: args.name,
  status: "custom",
  audience: args.audience,
  visualConcept: args.concept,
  differentiation: args.differentiation,
  navigationPattern: args.navigation,
  density: args.density,
  shapeLanguage: args.shape,
  typographyStrategy: args.typography,
  colorStrategy: args.colors,
  motionStrategy: args.motion,
  changedDimensions: args.dimensions
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
  referenceOnly: false
});

await writeFile(profilePath, `${JSON.stringify(profile, null, 2)}\n`, "utf8");
console.log(`Design brief initialized for: ${profile.profileId}`);
console.log(
  "Next: replace the values in src/design/active-profile.css, then run npm run design:check."
);
