#!/usr/bin/env bun

import fs from "node:fs";
import path from "node:path";
import { $ } from "bun";

const PACKAGES_DIR = path.resolve(import.meta.dir, "..", "packages");
const PUBLISH_ORDER = ["types", "utils", "core", "cli"]; // leaf deps first

interface PkgJson {
  name: string;
  version: string;
  private?: boolean;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

async function isPublished(name: string, version: string): Promise<boolean> {
  const url = `https://registry.npmjs.org/${encodeURIComponent(name)}/${version}`;
  const res = await fetch(url);
  return res.ok; // 200 = this exact version exists, 404 = it doesn't
}

function readPkg(pkgPath: string): PkgJson {
  return JSON.parse(fs.readFileSync(pkgPath, "utf8"));
}

function writePkg(pkgPath: string, pkg: PkgJson): void {
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
}

// Every workspace package's real, current version — read straight off disk,
// not from bun's lockfile (which doesn't reliably re-resolve workspace:*
// specifiers just because a version bumped; the specifier string itself
// never changes, so bun install has no signal to re-check it).
function buildVersionMap(): Map<string, string> {
  const map = new Map<string, string>();

  for (const dir of fs.readdirSync(PACKAGES_DIR)) {
    const pkgPath = path.join(PACKAGES_DIR, dir, "package.json");
    if (!fs.existsSync(pkgPath)) continue;

    const pkg = readPkg(pkgPath);
    map.set(pkg.name, pkg.version);
  }

  return map;
}

// Rewrite workspace:* -> the dependency's real current version ourselves,
// instead of trusting `bun publish` to do it correctly at pack time.
function resolveWorkspaceDeps(
  pkg: PkgJson,
  versions: Map<string, string>,
): PkgJson {
  const resolved = structuredClone(pkg);

  for (const field of ["dependencies", "devDependencies"] as const) {
    const deps = resolved[field];
    if (!deps) continue;

    for (const [depName, range] of Object.entries(deps)) {
      if (!range.startsWith("workspace:")) continue;

      const version = versions.get(depName);

      if (!version) {
        throw new Error(
          `Cannot resolve workspace dependency "${depName}" — no local package found with that name.`,
        );
      }

      deps[depName] = `^${version}`;
    }
  }

  return resolved;
}

const versions = buildVersionMap();

console.log("🔄 refreshing lockfile before publish..");
await $`bun install`;

for (const dir of PUBLISH_ORDER) {
  const pkgPath = path.join(PACKAGES_DIR, dir, "package.json");
  if (!fs.existsSync(pkgPath)) continue;

  const original = readPkg(pkgPath);
  if (original.private) continue;

  if (await isPublished(original.name, original.version)) {
    console.log(
      `⏭  ${original.name}@${original.version} already published, skipping`,
    );
    continue;
  }

  const resolved = resolveWorkspaceDeps(original, versions);

  console.log(`📦 ${resolved.name}@${resolved.version}`);

  // write the resolved package.json for packing, then always restore the
  // original workspace:* version afterward so the source tree is untouched
  writePkg(pkgPath, resolved);

  try {
    await $`bun publish --access public`.cwd(path.dirname(pkgPath));
  } finally {
    writePkg(pkgPath, original);
  }
}
