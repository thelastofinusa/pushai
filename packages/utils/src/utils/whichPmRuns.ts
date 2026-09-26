import path from "node:path";
import type { PackageManagerInfo } from "@pushai/types";
import { whichPMRuns } from "which-pm-runs";

const MANAGERS: Record<string, PackageManagerInfo> = {
  npm: { name: "npm", installer: "npm install", runner: "npx" },
  pnpm: { name: "pnpm", installer: "pnpm add", runner: "pnpm dlx" },
  yarn: { name: "yarn", installer: "yarn add", runner: "yarn dlx" },
  bun: { name: "bun", installer: "bun add", runner: "bunx" },
};

/**
 * `npm_config_user_agent` (what `which-pm-runs` reads) isn't reliably set
 * for one-off dlx-style execution — bunx never sets it — so the resolved
 * script path each tool downloads into is the only signal that's actually
 * present every time. Path-sniff first, fall back to the env var second.
 */
function detectRunnerFromPath(executable: string): PackageManagerInfo | null {
  if (/[\\/]bunx-/.test(executable)) return MANAGERS.bun;
  if (/[\\/]_npx[\\/]/.test(executable)) return MANAGERS.npm;
  if (/[\\/]\.pnpm[\\/]dlx|[\\/]pnpm-dlx/.test(executable))
    return MANAGERS.pnpm;
  if (/[\\/]\.yarn[\\/].*dlx|yarn[\\/]dlx-/.test(executable))
    return MANAGERS.yarn;

  return null;
}

export function getPackageManager(): PackageManagerInfo {
  const executable = process.argv[1] ?? "";

  return (
    detectRunnerFromPath(executable) ??
    MANAGERS[whichPMRuns()?.name ?? ""] ??
    MANAGERS.npm
  );
}

export function getCliCommand() {
  const executable = process.argv[1] ?? "";

  // Installed globally/locally and exposed through the `pai` bin — never a
  // dlx-style temp path, so this check comes before anything else.
  if (path.basename(executable) === "pai") {
    return "pai";
  }

  const { runner } = getPackageManager();

  return `${runner} pushai`;
}
