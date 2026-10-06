import { rmSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { confirm, input, select } from "@inquirer/prompts";
import {
  adoptRemoteBranch,
  createGitService,
  describeRemoteError,
  fetchBranch,
  initWithBranch,
  inspectRemote,
  listMissingFiles,
  restoreFiles,
  setRemote,
} from "@pushai/core";
import { showHeader, spinner } from "@pushai/utils";
import chalk from "chalk";
import { pkgConfig } from "../config/config.config";
import { formatRemoteUrl } from "../lib/format";
import { showTree } from "../lib/show";

const git = createGitService();

export interface EnsureRepoResult {
  isRepo: boolean;
  branch: string;
}

export interface EnsureRepoOptions {
  /** Never touch the filesystem or the network-facing git state. */
  dryRun?: boolean;
}

const NOT_A_REPO: EnsureRepoResult = { isRepo: false, branch: "" };

/**
 * Removes the `.git` directory this setup flow created. Only ever called after
 * we've confirmed there was no repository when setup started.
 */
function rollbackGitDir() {
  rmSync(path.join(process.cwd(), ".git"), { recursive: true, force: true });
}

/**
 * Ensures a Git repository exists in the current directory and offers
 * initialization workflows.
 */
export async function handleEnsureRepo(
  baseCommand: string,
  options: EnsureRepoOptions = {},
): Promise<EnsureRepoResult> {
  if (await git.isRepo()) {
    const branch = await git.getCurrentBranch();
    return { isRepo: true, branch };
  }

  spinner.fail("no git repository found in this directory.");

  if (options.dryRun) {
    showHeader({
      title: "dry run makes no changes. run without --dry-run to set up git.",
      color: chalk.dim,
      symbol: "info",
      type: "outro",
    });

    return NOT_A_REPO;
  }

  const choice = await select({
    message: "how do you want to setup Git?",
    choices: [
      {
        name: "initialize a new repository",
        value: "init",
        description:
          "Initialize Git and create a README if the directory is empty",
      },
      {
        name: "connect to remote repository",
        value: "remote",
        description:
          "Initialize Git, track the remote's default branch, and set origin",
      },
      {
        name: "skip git setup",
        value: "cancel",
        description: "Exit without making any repository changes",
      },
    ],
  });

  if (choice === "cancel") {
    showHeader({
      title: "repository setup skipped.",
      color: chalk.dim,
      symbol: "info",
      type: "outro",
    });

    return NOT_A_REPO;
  }

  if (choice === "init") {
    spinner.start("initializing Git..");

    try {
      await git.init();
      spinner.succeed("initialized Git repository");
    } catch (error) {
      spinner.fail(
        error instanceof Error
          ? error.message
          : "failed to initialize Git repository.",
      );

      return NOT_A_REPO;
    }

    await handleReadmeCreation(baseCommand);

    return { isRepo: true, branch: await git.getCurrentBranch() };
  }

  return connectRemote(baseCommand);
}

/**
 * Connects the current directory to an existing remote repository.
 * Nothing local is created until the remote has been verified, and anything
 * created is removed again if a later step fails.
 */
async function connectRemote(baseCommand: string): Promise<EnsureRepoResult> {
  const remoteInput = await input({
    message: "remote repository (username/repo, URL, or SSH):",
    validate: (value) => {
      if (!value.trim()) return "repository cannot be empty.";

      try {
        formatRemoteUrl(value);
        return true;
      } catch (error) {
        return error instanceof Error
          ? error.message
          : "invalid repository URL.";
      }
    },
  });

  let remoteUrl: string;

  try {
    remoteUrl = formatRemoteUrl(remoteInput);
  } catch (error) {
    spinner.fail(
      error instanceof Error ? error.message : "invalid repository URL.",
    );

    return NOT_A_REPO;
  }

  // 1. Verify first. Read-only: nothing local exists yet.
  spinner.start("verifying remote repository..");

  let defaultBranch: string | null;

  try {
    ({ defaultBranch } = await inspectRemote(remoteUrl));
    spinner.succeed("verification successful");
  } catch (error) {
    spinner.fail(describeRemoteError(error));

    showHeader({
      title: "remote verification failed.",
      color: chalk.red,
      symbol: "error",
      type: "outro",
    });

    return NOT_A_REPO;
  }

  const branchName = defaultBranch ?? "main";

  // If the user hits Ctrl+C mid-setup, don't leave a half-built .git behind.
  const onInterrupt = () => {
    rollbackGitDir();
    process.exit(130);
  };

  process.once("SIGINT", onInterrupt);

  const fail = (message: string, title: string): EnsureRepoResult => {
    spinner.fail(message);
    rollbackGitDir();

    showHeader({
      title: `${title} no changes were left behind.`,
      color: chalk.red,
      symbol: "error",
      type: "outro",
    });

    return NOT_A_REPO;
  };

  try {
    // 2. Local setup
    spinner.start("setting up Git..");

    try {
      await initWithBranch(branchName);
      await setRemote(remoteUrl);
      spinner.succeed(`connected ${chalk.cyan(remoteUrl)}`);
    } catch (error) {
      return fail(describeRemoteError(error), "git setup failed.");
    }

    // 3. Adopt the remote history (if any)
    if (defaultBranch) {
      spinner.start("fetching remote history..");

      try {
        await fetchBranch(defaultBranch, {
          onProgress: (line) => {
            spinner.text = line;
          },
        });

        spinner.succeed("remote history fetched");
      } catch (error) {
        return fail(describeRemoteError(error), "remote history fetch failed.");
      }

      spinner.start(`tracking origin/${defaultBranch}..`);

      try {
        // Keeps all local files; differences simply show up as changes.
        await adoptRemoteBranch(defaultBranch);
        spinner.succeed(
          `tracking ${chalk.cyan(`origin/${defaultBranch}`)} (local files kept)`,
        );
      } catch (error) {
        return fail(describeRemoteError(error), "could not adopt history.");
      }

      await offerToRestoreMissingFiles();
    } else {
      await handleReadmeCreation(baseCommand);
    }
  } finally {
    process.removeListener("SIGINT", onInterrupt);
  }

  console.log();

  showTree({
    headerTitle: "remote repository setup",
    items: [
      {
        title: `${branchName} branch and origin configured`,
        description: `Remote: ${remoteUrl}`,
      },
    ],
    color: chalk.cyan,
  });

  console.log();

  return { isRepo: true, branch: await git.getCurrentBranch() };
}

/**
 * Remote files that don't exist locally would be committed as deletions by the
 * next `pai commit`. Offer to bring them back (this never overwrites local edits).
 * Non-fatal: the repository is already valid at this point.
 */
async function offerToRestoreMissingFiles() {
  try {
    const missing = await listMissingFiles();

    if (missing.length === 0) return;

    const count = `${missing.length} file${missing.length === 1 ? "" : "s"}`;

    const restore = await confirm({
      message: `${count} on the remote ${missing.length === 1 ? "is" : "are"} missing locally. restore? (otherwise the next commit deletes them)`,
      default: true,
    });

    if (!restore) return;

    spinner.start("restoring files..");
    await restoreFiles(missing);
    spinner.succeed(`restored ${count}`);
  } catch (error) {
    spinner.fail(describeRemoteError(error));
  }
}

/**
 * Helper to prompt for README creation if directory is empty.
 */
async function handleReadmeCreation(baseCommand: string) {
  const files = await fs.readdir(process.cwd());
  const visibleFiles = files.filter((file) => file !== ".git");

  if (visibleFiles.length === 0) {
    const shouldCreateReadme = await confirm({
      message: "directory is empty. create a standard README.md?",
      default: true,
    });

    if (!shouldCreateReadme) {
      return;
    }

    const folderName = path.basename(process.cwd());

    const readmeContent =
      `# ${folderName}\n\n` +
      `Project initialized with ${baseCommand}.\n\n` +
      `Powered by [${pkgConfig.name}](${pkgConfig.homepage}).`;

    spinner.start("creating README.md..");

    try {
      await fs.writeFile("README.md", readmeContent, "utf-8");
      spinner.succeed("created README.md");
    } catch (error) {
      spinner.fail(
        error instanceof Error ? error.message : "failed to create README.md.",
      );
    }
  }
}

/**
 * Checks for git merge conflicts and reports affected files.
 */
export async function handleCheckConflicts(): Promise<boolean> {
  const status = await git.getStatus();

  if (status.conflicted.length > 0) {
    spinner.fail(`${status.conflicted.length} file(s) have merge conflicts.`);

    for (const file of status.conflicted) {
      console.log(`  ${chalk.red("✖")} ${file}`);
    }

    return true;
  }

  return false;
}
