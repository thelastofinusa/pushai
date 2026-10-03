import path from "node:path";
import type { PackageManagerInfo } from "@pushai/types";
import { whichPMRuns } from "which-pm-runs";

export const MANAGERS: Record<string, PackageManagerInfo> = {
  npm: { name: "npm", installer: "npm install", runner: "npx" },
  pnpm: { name: "pnpm", installer: "pnpm add", runner: "pnpm dlx" },
  yarn: { name: "yarn", installer: "yarn add", runner: "yarn dlx" },
  bun: { name: "bun", installer: "bun add", runner: "bunx" },
};

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
  const execName = path
    .basename(executable)
    .replace(/\.(js|cjs|mjs|exe|cmd|ps1)$/, "");

  // 1. If executed via temporary runner paths (npx, bunx, pnpm dlx, yarn dlx)
  if (detectRunnerFromPath(executable)) {
    const { runner } = getPackageManager();
    return `${runner} pushai`;
  }

  // 2. If invoked via `pai` binary executable or symlink
  if (execName === "pai" || process.env._?.endsWith("pai")) {
    return "pai";
  }

  // 3. If invoked globally/locally as `pushai`
  if (execName === "pushai" || process.env._?.endsWith("pushai")) {
    return "pushai";
  }

  // 4. Default fallback for global binary execution
  return "pai";
}
