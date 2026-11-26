#!/usr/bin/env bun

import fs from "node:fs";
import path from "node:path";
import { $ } from "bun";

const PKG_DIR = path.resolve(import.meta.dir, "..", "packages", "pushai");
const PKG_PATH = path.join(PKG_DIR, "package.json");

async function isPublished(name: string, version: string): Promise<boolean> {
  const url = `https://registry.npmjs.org/${encodeURIComponent(name)}/${version}`;
  const res = await fetch(url);
  return res.ok; // 200 = already up, 404 = not yet published
}

const pkg = JSON.parse(fs.readFileSync(PKG_PATH, "utf8")) as {
  name: string;
  version: string;
  private?: boolean;
};

if (pkg.private) {
  console.error(`✖ ${pkg.name} is marked private — refusing to publish.`);
  process.exit(1);
}

if (await isPublished(pkg.name, pkg.version)) {
  console.log(`⏭  ${pkg.name}@${pkg.version} already published, skipping`);
  process.exit(0);
}

console.log("🔄 refreshing lockfile before publish..");
await $`bun install`;

console.log(`📦 ${pkg.name}@${pkg.version}`);
await $`bun publish --access public`.cwd(PKG_DIR);
