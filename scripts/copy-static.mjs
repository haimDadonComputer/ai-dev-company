import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";

const target = resolve("dist/public");
const compiledClient = resolve("dist/src");

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(resolve("src/index.html"), resolve(target, "index.html"));
await cp(resolve(compiledClient, "main.js"), resolve(target, "main.js"));

for (const directory of ["app", "pages", "components", "services", "models", "types"]) {
  await cp(resolve(compiledClient, directory), resolve(target, directory), {
    recursive: true,
    filter: (source) => extname(source) !== ".map"
  });
}

async function copyStaticFiles(sourceDirectory) {
  for (const entry of await readdir(sourceDirectory, { withFileTypes: true })) {
    const source = join(sourceDirectory, entry.name);
    if (entry.isDirectory()) {
      await copyStaticFiles(source);
      continue;
    }
    if (![".html", ".css"].includes(extname(entry.name))) {
      continue;
    }

    const destination = resolve(target, relative(resolve("src"), source));
    await mkdir(resolve(destination, ".."), { recursive: true });
    await cp(source, destination);
  }
}

await copyStaticFiles(resolve("src/app"));
await copyStaticFiles(resolve("src/design"));
await copyStaticFiles(resolve("src/pages"));
await copyStaticFiles(resolve("src/components"));
await mkdir(resolve(target, "design"), { recursive: true });
await cp(
  resolve("design-system/project-profile.json"),
  resolve(target, "design/project-profile.json")
);
await mkdir(resolve(target, "vendor"), { recursive: true });
await cp(
  resolve("node_modules/ag-grid-community/dist/ag-grid-community.min.js"),
  resolve(target, "vendor/ag-grid-community.min.js")
);
await cp(
  resolve("node_modules/ag-grid-community/styles/ag-grid.min.css"),
  resolve(target, "vendor/ag-grid.min.css")
);
await cp(
  resolve("node_modules/ag-grid-community/styles/ag-theme-quartz.min.css"),
  resolve(target, "vendor/ag-theme-quartz.min.css")
);
