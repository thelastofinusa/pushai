import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { confirm, input, Separator, select } from "@inquirer/prompts";
import { createGitService, generateCommitMessage } from "@pushai/core";
import type { CommitFlowOptions, SetupConfig } from "@pushai/types";
import { setSpinnerColor, showHeader, spinner } from "@pushai/utils";
import chalk from "chalk";
import type { Command } from "commander";
import { pkgConfig } from "../config/config.config";
import { configStore } from "../config/store.config";
import { getCommandTitle } from "../lib/command-title";
import { formatProvider } from "../lib/format";
import { showCommitMessage } from "../lib/messages";

export async function commitAction(
  options: CommitFlowOptions = {},
  command?: Command,
) {
  const { commandTitle, baseCommand } = getCommandTitle(command);

  showHeader({
    title: commandTitle,
    color: chalk.cyan,
    symbol: "sparkle",
    type: "intro",
  });

  setSpinnerColor("cyan");

  const git = createGitService();

  // Check if current directory is a git repository
  if (!(await git.isRepo())) {
    spinner.fail("no git repository found in this directory.");

    const shouldInit = await confirm({
      message: "would you like to initialize a new git repository?",
      default: true,
    });

    if (!shouldInit) {
      return;
    }

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
      return;
    }

    // Check if current working directory is empty (excluding .git folder)
    const files = await fs.readdir(process.cwd());
    const visibleFiles = files.filter((file) => file !== ".git");

    if (visibleFiles.length === 0) {
      const shouldCreateReadme = await confirm({
        message:
          "directory is empty. would you like to create a standard README file?",
        default: true,
      });

      if (shouldCreateReadme) {
        const folderName = path.basename(process.cwd());
        const readmeContent = `# ${folderName}

Project initialized with ${baseCommand}.

Powered by [${pkgConfig.name}](${pkgConfig.homepage}).`;

        spinner.start("creating README.md..");
        try {
          // Execute echo via shell child_process
          execSync(`echo ${JSON.stringify(readmeContent)} > README.md`);
          spinner.succeed("created README.md");
        } catch (_error) {
          // Fallback to Node fs if shell echo fails
          await fs.writeFile("README.md", readmeContent, "utf-8");
          spinner.succeed("created README.md");
        }
      }
    }
  }

  const branch = await git.getCurrentBranch();

  let message = options.customMessage?.trim();

  if (options.customMessage !== undefined && !message) {
    spinner.fail("commit message cannot be empty.");
    return;
  }

  let config = await configStore.getStoredConfig();
  let isLocalProvider = false;

  // A custom message skips provider configuration entirely.
  if (!message) {
    if (!config) return;

    const active = config.providers.find(
      (provider) => provider.id === config?.activeId,
    );

    if (!active) {
      spinner.fail("no active provider configured. run `pai setup`.");
      return;
    }

    isLocalProvider = active.mode === "local";

    spinner.succeed(`selected mode ${chalk.cyan(active.mode)}`);
    spinner.succeed(`provider ${chalk.cyan(formatProvider(active, true))}`);
  }

  await git.stageAll();

  const status = await git.getStatus();

  if (status.conflicted.length > 0) {
    spinner.fail(`${status.conflicted.length} file(s) have merge conflicts.`);

    for (const file of status.conflicted) {
      console.log(`  ${chalk.red("✖")} ${file}`);
    }

    return;
  }

  if (status.changed === 0) {
    showHeader({
      title: "no changes to commit.",
      color: chalk.blue,
      symbol: "info",
      type: "outro",
      exitType: 1,
    });

    return;
  }

  const diff = await git.getDiff();

  spinner.succeed(
    `staged diff read ${chalk.cyan(
      `${status.changed} file${status.changed === 1 ? "" : "s"}`,
    )}`,
  );

  if (branch) {
    spinner.succeed(`committing to ${chalk.cyan(branch)}`);
  }

  if (!message) {
    spinner.start("generating commit..");

    try {
      message = await generateCommitMessage(config as SetupConfig, diff);

      spinner.succeed("commit generated");
    } catch (error) {
      spinner.fail(
        error instanceof Error
          ? error.message
          : "failed to generate commit message.",
      );

      showHeader({
        title: "please try again or edit the message manually.",
        color: chalk.red,
        symbol: "error",
        type: "outro",
        exitType: 1,
      });

      return;
    }
  }

  console.log();
  showCommitMessage(message);

  if (options.dryRun) {
    showHeader({
      title: `dry run completed on ${branch}.`,
      color: chalk.blue,
      symbol: "flag",
      type: "outro",
    });

    return;
  }

  console.log();

  let shouldPush = Boolean(options.autoPush);

  // When --push flag is NOT passed, prompt user based on provider mode
  if (!options.autoPush) {
    while (true) {
      const choices = isLocalProvider
        ? [
            new Separator(),
            {
              name: "commit offline",
              value: "commit",
              description:
                "Create the commit locally without connecting to the remote",
            },
            {
              name: "commit & push",
              value: "push",
              description: "Create the commit and push it to the remote",
            },
            new Separator(),
          ]
        : [
            {
              name: "commit & push",
              value: "push",
              description: "Create the commit and push it to the remote",
            },
          ];

      const selectedAction = await select({
        message: "how would you like to proceed?",
        default: isLocalProvider ? "commit" : "push",
        choices: [
          ...choices,
          {
            name: "edit message",
            value: "edit",
            description: "Modify the commit message",
          },
          {
            name: "regenerate",
            value: "regenerate",
            description: "Generate a new AI commit message",
          },
          {
            name: "abort process",
            value: "cancel",
            description: "Abort without creating the commit",
          },
        ],
      });

      if (selectedAction === "commit" || selectedAction === "push") {
        shouldPush = selectedAction === "push";
        break;
      }

      if (selectedAction === "edit") {
        message = (
          await input({
            message: "update the commit message:",
            default: chalk.dim(message),
            prefill: "editable",
            validate: (value) =>
              value.trim() ? true : "commit message cannot be empty.",
          })
        ).trim();

        console.log();
        showCommitMessage(message);
        console.log();

        continue;
      }

      if (selectedAction === "regenerate") {
        if (!config) config = await configStore.getStoredConfig();
        if (!config) return;

        const active = config.providers.find(
          (provider) => provider.id === config?.activeId,
        );

        if (!active) {
          spinner.fail("no active provider configured. run `pai setup`.");
          return;
        }

        spinner.start("regenerating..");

        try {
          message = await generateCommitMessage(config, diff, true);
          spinner.succeed("new commit message generated");

          console.log();
          showCommitMessage(message);
          console.log();
        } catch (error) {
          spinner.fail(
            error instanceof Error
              ? error.message
              : "failed to regenerate commit message.",
          );

          showHeader({
            title: "please try again or edit the message manually.",
            color: chalk.red,
            symbol: "error",
            type: "outro",
          });
        }

        continue;
      }

      if (selectedAction === "cancel") {
        await git.unstageAll();

        showHeader({
          title: "commit cancelled.",
          color: chalk.dim,
          symbol: "info",
          type: "outro",
        });

        return;
      }
    }
  }

  const hash = await git.commit(message);

  spinner.succeed(`committed ${chalk.green(hash)}`);

  if (!shouldPush) {
    showHeader({
      title: `commit created on ${branch}. push when ready with \`pai push\`.`,
      color: chalk.green,
      symbol: "success",
      type: "outro",
    });

    return;
  }

  if (!(await git.hasRemote())) {
    showHeader({
      title: `commit created on ${branch}, but no remote named 'origin' was found.`,
      color: chalk.yellow,
      symbol: "warning",
      type: "outro",
    });

    return;
  }

  spinner.start("pushing changes..");

  try {
    await git.push(branch);
    spinner.succeed("successfully pushed changes");
  } catch (error) {
    spinner.fail(
      error instanceof Error ? error.message : "failed to push commit.",
    );

    showHeader({
      title: `commit created on ${branch}, but push failed.`,
      color: chalk.yellow,
      symbol: "warning",
      type: "outro",
    });

    return;
  }

  showHeader({
    title: `commit created and pushed to ${branch}.`,
    color: chalk.green,
    symbol: "success",
    type: "outro",
  });
}
