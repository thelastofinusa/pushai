import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

/* -------------------------------------------------------------------------- */
/*  Low-level runner                                                          */
/* -------------------------------------------------------------------------- */

export type GitFailureKind = "timeout" | "exit" | "spawn";

export class GitCommandError extends Error {
  kind: GitFailureKind;
  args: string[];
  code: number | null;

  constructor(
    message: string,
    kind: GitFailureKind,
    args: string[],
    code: number | null,
  ) {
    super(message);
    this.name = "GitCommandError";
    this.kind = kind;
    this.args = args;
    this.code = code;
  }
}

export interface RunGitOptions {
  cwd?: string;
  /** Extra env vars merged over the safe defaults. */
  env?: NodeJS.ProcessEnv;
  /**
   * Kill git if it produces NO output for this long. Unlike a total timeout,
   * a slow-but-moving download keeps resetting the timer.
   */
  idleTimeoutMs?: number;
  /** Called with the latest stderr line (progress, e.g. "Receiving objects: 40%"). */
  onProgress?: (line: string) => void;
}

export interface GitResult {
  stdout: string;
  stderr: string;
}

/** "git -c x=y fetch --progress ..." -> "fetch" (skips flags and -c values). */
function subcommand(args: string[]): string {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "-c") {
      i++;
      continue;
    }

    if (!args[i].startsWith("-")) return args[i];
  }

  return "command";
}

/** Pulls the most useful line out of git's stderr ("fatal: ..." beats progress noise). */
function summarize(text: string): string {
  const lines = text
    .split(/[\r\n]+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const important = [...lines]
    .reverse()
    .find((line) => /^(fatal|error|remote: (error|fatal)):/i.test(line));

  return important ?? lines.at(-1) ?? "";
}

/**
 * Runs git without a shell. Never prompts for credentials, forces English
 * output (so error matching is reliable) and always rejects with a
 * non-empty, human-readable message.
 */
export function runGit(
  args: string[],
  options: RunGitOptions = {},
): Promise<GitResult> {
  const { cwd, env, idleTimeoutMs, onProgress } = options;

  return new Promise((resolve, reject) => {
    const child = spawn("git", args, {
      cwd,
      env: {
        ...process.env,
        GIT_TERMINAL_PROMPT: "0", // fail instead of hanging on a prompt
        LC_ALL: "C", // stable, English error messages
        ...env,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let stalled = false;
    let idle: ReturnType<typeof setTimeout> | undefined;

    const arm = () => {
      if (!idleTimeoutMs) return;
      clearTimeout(idle);
      idle = setTimeout(() => {
        stalled = true;
        child.kill("SIGTERM");
        setTimeout(() => child.kill("SIGKILL"), 2000).unref();
      }, idleTimeoutMs);
    };

    arm();

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
      arm();
    });

    child.stderr.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      stderr += text;
      arm();

      if (onProgress) {
        const last = text
          .split(/[\r\n]+/)
          .filter(Boolean)
          .at(-1)
          ?.trim();
        if (last) onProgress(last);
      }
    });

    child.on("error", (error: NodeJS.ErrnoException) => {
      clearTimeout(idle);
      reject(
        new GitCommandError(
          error.code === "ENOENT"
            ? "git is not installed or not on your PATH."
            : error.message || "failed to start git.",
          "spawn",
          args,
          null,
        ),
      );
    });

    child.on("close", (code) => {
      clearTimeout(idle);

      if (stalled) {
        reject(
          new GitCommandError(
            `git ${subcommand(args)} stalled (no data for ${Math.max(1, Math.ceil((idleTimeoutMs ?? 0) / 1000))}s). check your connection and try again.`,
            "timeout",
            args,
            code,
          ),
        );
        return;
      }

      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(
        new GitCommandError(
          summarize(stderr) ||
            summarize(stdout) ||
            `git ${subcommand(args)} exited with code ${code}.`,
          "exit",
          args,
          code,
        ),
      );
    });
  });
}

/** Turns raw git errors into short messages a user can act on. */
export function describeRemoteError(error: unknown): string {
  if (!(error instanceof GitCommandError)) {
    return error instanceof Error ? error.message : "unknown git error.";
  }

  if (error.kind !== "exit") return error.message;

  const message = error.message.toLowerCase();

  if (
    message.includes("authentication failed") ||
    message.includes("could not read username") ||
    message.includes("terminal prompts disabled")
  ) {
    // GitHub answers "repo doesn't exist" with a credentials prompt, so a
    // typo and a private repo look identical from here.
    return "repository not found, or it is private and your git credentials are missing.";
  }

  if (message.includes("permission denied (publickey)")) {
    return "ssh key rejected. check that your key is added to your git host.";
  }

  if (
    message.includes("repository not found") ||
    message.includes("does not appear to be a git repository")
  ) {
    return "repository not found or access denied.";
  }

  if (
    message.includes("could not resolve host") ||
    message.includes("unable to access") ||
    message.includes("connection timed out")
  ) {
    return "unable to reach the remote repository.";
  }

  return error.message;
}

/* -------------------------------------------------------------------------- */
/*  Remote operations                                                         */
/* -------------------------------------------------------------------------- */

export interface RemoteInfo {
  /** The remote's default branch, or `null` if the remote is empty. */
  defaultBranch: string | null;
}

/**
 * Checks that a remote is reachable and finds its default branch.
 * Does not touch the local repository, so it is safe in --dry-run.
 */
export async function inspectRemote(
  url: string,
  options: Pick<RunGitOptions, "idleTimeoutMs"> = {},
): Promise<RemoteInfo> {
  const { stdout } = await runGit(["ls-remote", "--symref", url, "HEAD"], {
    idleTimeoutMs: options.idleTimeoutMs ?? 15_000,
  });

  if (!stdout.trim()) return { defaultBranch: null }; // empty remote

  const match = stdout.match(/^ref: refs\/heads\/(.+)\tHEAD$/m);

  // Non-symref servers: HEAD resolved but no branch name advertised.
  return { defaultBranch: match?.[1] ?? "main" };
}

export interface FetchOptions {
  cwd?: string;
  remote?: string;
  /** Set to 1 for a quick shallow fetch when full history isn't needed. */
  depth?: number;
  idleTimeoutMs?: number;
  onProgress?: (line: string) => void;
}

/** Fetches a single branch, streaming progress. Stalls (not slow links) time out. */
export function fetchBranch(branch: string, options: FetchOptions = {}) {
  const { remote = "origin", depth, ...rest } = options;

  return runGit(
    [
      "fetch",
      "--progress", // git hides progress when stderr isn't a TTY
      "--no-tags",
      ...(depth ? [`--depth=${depth}`] : []),
      remote,
      branch,
    ],
    { idleTimeoutMs: 30_000, ...rest },
  );
}

/**
 * Points an (unborn) local branch at the remote branch while keeping every
 * local file untouched. Local differences show up as ordinary changes, so the
 * next `pai commit` builds on top of the remote history.
 */
export async function adoptRemoteBranch(
  branch: string,
  options: { cwd?: string; remote?: string } = {},
) {
  const { cwd, remote = "origin" } = options;

  await runGit(["reset", "--mixed", `${remote}/${branch}`], { cwd });
  await runGit(["branch", `--set-upstream-to=${remote}/${branch}`, branch], {
    cwd,
  }).catch(() => {
    // Upstream is also set on first push; not worth failing setup over.
  });
}

/**
 * Tracked files that exist on the remote branch but are missing from the
 * working tree. After `adoptRemoteBranch` these would otherwise be committed
 * as deletions.
 */
export async function listMissingFiles(cwd?: string): Promise<string[]> {
  const { stdout } = await runGit(["ls-files", "--deleted", "-z"], { cwd });
  return stdout.split("\0").filter(Boolean);
}

/** Restores only the given files from the index; other local edits are untouched. */
export async function restoreFiles(files: string[], cwd?: string) {
  const CHUNK = 200; // stay well under OS argv limits

  for (let i = 0; i < files.length; i += CHUNK) {
    await runGit(
      ["--literal-pathspecs", "checkout", "--", ...files.slice(i, i + CHUNK)],
      { cwd },
    );
  }
}

/** `git init` with the first branch name set safely (works on every git version). */
export async function initWithBranch(
  branch: string,
  options: { cwd?: string } = {},
) {
  await runGit(["init"], options);
  await runGit(["symbolic-ref", "HEAD", `refs/heads/${branch}`], options);
}

export async function setRemote(
  url: string,
  options: { cwd?: string; remote?: string } = {},
) {
  const { cwd, remote = "origin" } = options;

  try {
    await runGit(["remote", "add", remote, url], { cwd });
  } catch {
    await runGit(["remote", "set-url", remote, url], { cwd });
  }
}

/* -------------------------------------------------------------------------- */
/*  Read-only snapshot for --dry-run                                          */
/* -------------------------------------------------------------------------- */

export interface WorkingTreeSnapshot {
  diff: string;
  files: string[];
}

/**
 * Computes what `git add -A && git diff --staged` would produce, using a
 * throwaway index file so the real index (and anything the user already
 * staged) is never touched.
 */
export async function getWorkingTreeSnapshot(
  cwd: string = process.cwd(),
): Promise<WorkingTreeSnapshot> {
  const indexFile = path.join(
    os.tmpdir(),
    `pai-index-${process.pid}-${Date.now()}`,
  );
  const env = { GIT_INDEX_FILE: indexFile };

  try {
    // Seed from HEAD when it exists; an unborn branch simply starts empty.
    await runGit(["read-tree", "HEAD"], { cwd, env }).catch(() => undefined);
    await runGit(["add", "-A"], { cwd, env });

    const [{ stdout: diff }, { stdout: names }] = await Promise.all([
      runGit(["diff", "--staged"], { cwd, env }),
      runGit(["diff", "--staged", "--name-only"], { cwd, env }),
    ]);

    return { diff, files: names.split("\n").filter(Boolean) };
  } finally {
    await fs.rm(indexFile, { force: true });
  }
}
