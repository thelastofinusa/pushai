import { Separator, select } from "@inquirer/prompts";
import {
  createGitService,
  generateCommitMessage,
  getWorkingTreeSnapshot,
} from "@pushai/core";
import type { CommitFlowOptions, SetupConfig } from "@pushai/types";
import { showHeader, spinner } from "@pushai/utils";
import chalk from "chalk";
import type { Command } from "commander";
import { handleEnsureConfig } from "../handlers/config.helper";
import {
  handleCheckConflicts,
  handleEnsureRepo,
} from "../handlers/git-setup.handler";
import { getCommandTitle } from "../lib/command-title";
import { formatProvider } from "../lib/format";
import { showCommitMessage } from "../lib/show";

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

  // 1. Ensure Repository Exists via Handler
  const repoState = await handleEnsureRepo(baseCommand, {
    dryRun: options.dryRun,
  });
  if (!repoState.isRepo) return;

  let message = options.customMessage?.trim();

  if (options.customMessage !== undefined && !message) {
    spinner.fail("commit message cannot be empty.");
    return;
  }

  let config: SetupConfig | undefined;
  let isLocalProvider = false;

  // Custom message skips provider configuration
  if (!message) {
    const configResult = await handleEnsureConfig("cyan");
    if (typeof configResult === "boolean") return configResult;
    config = configResult;

    const active = config.providers.find(
      (provider) => provider.id === config?.activeId,
    );

    if (!active) {
      spinner.fail("no active provider configured. run `pai setup`.");
      return;
    }

    isLocalProvider = active.mode === "local";

    spinner.succeed(`provider ${chalk.cyan(formatProvider(active, true))}`);
  }

  const git = createGitService();

  if (!options.dryRun) {
    await git.stageAll();
  }

  // 2. Conflict Check via Handler
  const hasConflicts = await handleCheckConflicts();
  if (hasConflicts) return;

  let changed: number;
  let diff: string;

  if (options.dryRun) {
    const snapshot = await getWorkingTreeSnapshot();
    changed = snapshot.files.length;
    diff = snapshot.diff;
  } else {
    changed = (await git.getStatus()).changed;
    diff = changed === 0 ? "" : await git.getDiff();
  }

  if (changed === 0) {
    showHeader({
      title: "no changes to commit.",
      color: chalk.blue,
      symbol: "info",
      type: "outro",
      exitType: 1,
    });

    return;
  }

  spinner.succeed(
    `staged diff read ${chalk.cyan(`${changed} file${changed === 1 ? "" : "s"}`)}`,
  );

  if (repoState.branch) {
    spinner.succeed(`committing to ${chalk.cyan(repoState.branch)}`);
  }

  if (!message) {
    spinner.start("generating commit..");

    try {
      message = await generateCommitMessage(config as SetupConfig, diff);

      spinner.succeed("message generated");
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
  showCommitMessage(message, chalk.green);

  if (options.dryRun) {
    showHeader({
      title: `dry run completed on ${repoState.branch}.`,
      color: chalk.blue,
      symbol: "flag",
      type: "outro",
    });

    return;
  }

  console.log();

  let shouldPush = Boolean(options.autoPush);

  if (!options.autoPush) {
    while (true) {
      const selectedAction = await select({
        message: "how would you like to proceed?",
        default: isLocalProvider ? "commit" : "push",
        choices: [
          ...(isLocalProvider
            ? [
                {
                  name: "save locally",
                  value: "commit",
                  description: "Create the commit without pushing to origin",
                },
              ]
            : []),
          {
            name: "publish to remote",
            value: "push",
            description: "Create the commit and push directly to origin",
          },
          {
            name: "regenerate",
            value: "regenerate",
            description: "Generate a new AI commit message",
          },
          new Separator(),
          {
            name: "keep working tree",
            value: "cancel",
            description:
              "Discard proposed message and leave staged files uncommitted",
          },
        ],
      });

      if (selectedAction === "commit" || selectedAction === "push") {
        shouldPush = selectedAction === "push";
        break;
      }

      if (selectedAction === "regenerate") {
        if (!config) {
          const configResult = await handleEnsureConfig("cyan");
          if (typeof configResult === "boolean") return configResult;
          config = configResult;
        }

        spinner.start("regenerating..");

        try {
          message = await generateCommitMessage(config, diff, true);
          spinner.succeed("message regenerated");

          console.log();
          showCommitMessage(message, chalk.yellow);
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
          title: "commit cancelled. changes remain staged.",
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
      title: `commit created on ${repoState.branch}. push when ready with \`pai push\`.`,
      color: chalk.green,
      symbol: "success",
      type: "outro",
    });

    return;
  }

  if (!(await git.hasRemote())) {
    showHeader({
      title: `commit created on ${repoState.branch}, but no remote named 'origin' was found.`,
      color: chalk.yellow,
      symbol: "warning",
      type: "outro",
    });

    return;
  }

  spinner.start("pushing changes..");

  try {
    await git.push(repoState.branch);
    spinner.succeed("successfully pushed changes");
  } catch (error) {
    spinner.fail(
      error instanceof Error ? error.message : "failed to push commit.",
    );

    showHeader({
      title: `commit created on ${repoState.branch}, but push failed.`,
      color: chalk.yellow,
      symbol: "warning",
      type: "outro",
    });

    return;
  }

  showHeader({
    title: `commit created and pushed to ${repoState.branch}.`,
    color: chalk.green,
    symbol: "success",
    type: "outro",
  });
}
