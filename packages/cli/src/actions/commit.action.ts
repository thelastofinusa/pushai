import { input, Separator, select } from "@inquirer/prompts";
import { createGitService, generateCommitMessage } from "@pushai/core";
import type { CommitFlowOptions, SetupConfig } from "@pushai/types";
import {
  getCliCommand,
  setSpinnerColor,
  showHeader,
  spinner,
} from "@pushai/utils";
import chalk from "chalk";
import { pkgConfig } from "../config/config.config";
import { configStore } from "../config/store.config";
import { formatProvider } from "../lib/format";
import { showCommitMessage } from "../lib/messages";

export async function commitAction(
  action: string,
  options: CommitFlowOptions = {},
) {
  const command = getCliCommand();

  const title = [
    command,
    action,
    options.dryRun ? "--dry-run" : undefined,
    options.autoPush ? "--push" : undefined,
    options.customMessage ? "--message" : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  showHeader({
    title: `${title} - v${pkgConfig.version}`,
    color: chalk.cyan,
    symbol: "sparkle",
    type: "intro",
  });

  setSpinnerColor("cyan");

  const git = createGitService();

  if (!(await git.isRepo())) {
    spinner.fail("no git repository found in this directory.");
    return;
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

    spinner.succeed(`provider ${chalk.cyan(formatProvider(active))}`);
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

  if (status.changed > 0) {
    spinner.info("no changes to commit.");
    return;
  }

  const diff = await git.getDiff();

  spinner.succeed(
    `staged diff read ${chalk.cyan(
      `${status.changed} file${status.changed === 1 ? "" : "s"}`,
    )}`,
  );

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

  let shouldPush = options.autoPush;

  while (true) {
    const selectedAction = await select({
      message: "how would you like to proceed?",
      default: isLocalProvider && options.autoPush ? "push" : "commit",
      choices: [
        ...(isLocalProvider
          ? [
              new Separator(),
              {
                name: "commit locally",
                value: "commit",
                description: "Create the commit locally without pushing",
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
                name: options.autoPush ? "commit & push" : "commit",
                value: "commit",
                description: options.autoPush
                  ? "Create the commit and push it to the remote"
                  : "Create the commit locally",
              },
            ]),
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
      shouldPush = isLocalProvider
        ? selectedAction === "push"
        : options.autoPush;

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
