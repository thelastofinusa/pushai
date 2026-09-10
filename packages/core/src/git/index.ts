import simpleGit, { type SimpleGit } from "simple-git";
import type { GitStatusResult, MergeConflictFile } from "../types/index.js";

const git: SimpleGit = simpleGit();

const LOCKFILES = [
  "bun.lock",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
];

/**
 * Check repository status: staged files, current branch, and conflict state.
 */
export async function getGitStatus(): Promise<GitStatusResult> {
  const status = await git.status();

  return {
    currentBranch: status.current || "HEAD",
    stagedFiles: status.staged,
    hasConflicts: status.conflicted.length > 0,
    conflictFiles: status.conflicted,
  };
}

/**
 * Get staged diff and strip out noisy noise like lockfiles and excess whitespace.
 */
export async function getStagedDiff(maxCharacters = 12000): Promise<string> {
  const rawDiff = await git.diff(["--staged"]);

  if (!rawDiff.trim()) {
    return "";
  }

  const cleanedDiff = sanitizeDiff(rawDiff);

  if (cleanedDiff.length > maxCharacters) {
    return `${cleanedDiff.substring(0, maxCharacters)}\n\n[Diff truncated due to context window limits]`;
  }

  return cleanedDiff;
}

/**
 * Removes lockfiles and repetitive binary noise from diffs.
 */
export function sanitizeDiff(diff: string): string {
  const lines = diff.split("\n");
  const filteredLines: string[] = [];
  let isIgnoringFile = false;

  for (const line of lines) {
    if (line.startsWith("diff --git")) {
      isIgnoringFile = LOCKFILES.some((lockfile) => line.includes(lockfile));
    }

    if (!isIgnoringFile) {
      filteredLines.push(line);
    }
  }

  return filteredLines.join("\n");
}

/**
 * Extracts raw conflict blocks (<<<<<<<, =======, >>>>>>>) from conflicted files.
 */
export async function getConflictDetails(
  filePath: string,
): Promise<MergeConflictFile | null> {
  try {
    const fs = await import("node:fs/promises");
    const content = await fs.readFile(filePath, "utf-8");

    if (!content.includes("<<<<<<<")) {
      return null;
    }

    return {
      filePath,
      conflictContent: content,
    };
  } catch {
    return null;
  }
}
