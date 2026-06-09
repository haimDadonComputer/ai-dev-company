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
