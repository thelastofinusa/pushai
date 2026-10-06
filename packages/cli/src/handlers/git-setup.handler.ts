import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { confirm, input, select } from "@inquirer/prompts";
import { createGitService } from "@pushai/core";
import { showHeader, spinner } from "@pushai/utils";
import chalk from "chalk";
import { pkgConfig } from "../config/config.config";
import { showTree } from "../lib/show";

const git = createGitService();

export interface EnsureRepoResult {
  isRepo: boolean;
  branch: string;
}

/**
 * Ensures a Git repository exists in the current directory and offers initialization workflows.
 */
export async function handleEnsureRepo(
  baseCommand: string,
): Promise<EnsureRepoResult> {
  if (await git.isRepo()) {
    const branch = await git.getCurrentBranch();
    return { isRepo: true, branch };
  }

  spinner.fail("no git repository found in this directory.");

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
          "Initialize git, rename branch to main, and set remote origin URL",
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
    return { isRepo: false, branch: "" };
  }

  if (choice === "init") {
    spinner.start("initializing git repository..");
    try {
      await git.init();
      spinner.succeed("initialized empty git repository");
    } catch (error) {
      spinner.fail(
        error instanceof Error
          ? error.message
          : "failed to initialize git repository.",
      );
      return { isRepo: false, branch: "" };
    }

    await handleReadmeCreation(baseCommand);
    const branch = await git.getCurrentBranch();
    return { isRepo: true, branch };
  }

  if (choice === "remote") {
    const remoteUrl = await input({
      message:
        "enter remote repository url (e.g. https://github.com/user/repo.git):",
      validate: (value) =>
        value.trim().length > 0 ? true : "remote URL cannot be empty.",
    });

    spinner.start("initializing and attaching remote origin..");
    try {
      await git.init();
      execSync("git branch -M main", { stdio: "ignore" });
      execSync(`git remote add origin ${remoteUrl.trim()}`, {
        stdio: "ignore",
      });
      spinner.succeed(`attached remote origin ${chalk.cyan(remoteUrl.trim())}`);
    } catch (error) {
      spinner.fail(
        error instanceof Error
          ? error.message
          : "failed to attach remote origin.",
      );
      return { isRepo: false, branch: "" };
    }

    await handleReadmeCreation(baseCommand);

    showTree({
      headerTitle: "remote repository setup",
      items: [
        {
          title: "created branch main and set origin",
          description: `Remote: ${remoteUrl.trim()}`,
        },
      ],
      color: chalk.cyan,
    });

    const branch = await git.getCurrentBranch();
    return { isRepo: true, branch };
  }

  return { isRepo: false, branch: "" };
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

    if (shouldCreateReadme) {
      const folderName = path.basename(process.cwd());
      const readmeContent = `# ${folderName}\n\nProject initialized with ${baseCommand}.\n\nPowered by [${pkgConfig.name}](${pkgConfig.homepage}).`;

      spinner.start("creating README.md..");
      try {
        execSync(`echo ${JSON.stringify(readmeContent)} > README.md`);
        spinner.succeed("created README.md");
      } catch (_error) {
        await fs.writeFile("README.md", readmeContent, "utf-8");
        spinner.succeed("created README.md");
      }
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
