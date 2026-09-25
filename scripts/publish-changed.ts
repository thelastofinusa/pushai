#!/usr/bin/env bun

import fs from "node:fs";
import path from "node:path";
import { $ } from "bun";

const PACKAGES_DIR = path.resolve(import.meta.dir, "..", "packages");
const PUBLISH_ORDER = ["types", "utils", "core", "cli"]; // leaf deps first

async function isPublished(name: string, version: string): Promise<boolean> {
  const url = `https://registry.npmjs.org/${encodeURIComponent(name)}/${version}`;
  const res = await fetch(url);
  return res.ok; // 200 = this exact version exists, 404 = it doesn't
}

for (const dir of PUBLISH_ORDER) {
  const pkgPath = path.join(PACKAGES_DIR, dir, "package.json");
  if (!fs.existsSync(pkgPath)) continue;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  if (pkg.private) continue;

  if (await isPublished(pkg.name, pkg.version)) {
    console.log(`⏭  ${pkg.name}@${pkg.version} already published, skipping`);
    continue;
  }

  console.log(`📦 ${pkg.name}@${pkg.version}`);
  await $`bun publish --access public`.cwd(path.dirname(pkgPath));
}
