import fs from "node:fs";
import { confirm, input, select } from "@inquirer/prompts";
import { createGitService, generateCommitMessage } from "@pushai/core";
import type { CommitFlowOptions, SetupConfig } from "@pushai/types";
import { showHeader } from "@pushai/utils";
import chalk from "chalk";
import { getConfig } from "../../config/store.config";
import { formatProvider } from "../../lib/format";
import { showCommitMessage } from "../../lib/messages";
import { spinner } from "../../lib/spinner";

export async function runCommit(options: CommitFlowOptions = {}) {
  showHeader({
    title: "AI-generated Git commit",
    color: chalk.cyan,
    type: "intro",
    symbol: "sparkle",
  });

  const git = createGitService();

  /* ---------------------------------------------------------------- */
  /* Git repository                                                   */
  /* ---------------------------------------------------------------- */

  if (!(await git.isRepo())) {
    spinner.warn("No git repository found in this directory.");

    const proceed = await confirm({
      message: "Would you like to initialize a new git repository?",
      default: true,
    });

    if (!proceed) {
      showHeader({
        title: "Commit cancelled. No git repository was initialized.",
        color: chalk.dim,
        symbol: "info",
        type: "outro",
      });

      return;
    }

    spinner.start("Initializing git repository..");
    await git.init();
    spinner.succeed("Git repository initialized.");

    const files = fs
      .readdirSync(process.cwd())
      .filter((file) => file !== ".git");

    if (files.length === 0) {
      const createReadme = await confirm({
        message: "Repository is empty. Create an initial README.md?",
        default: true,
      });

      if (createReadme) {
        fs.writeFileSync("README.md", "# PushAI Project\n\nInitial commit");

        await git.add("README.md");

        spinner.succeed("README.md created and staged.");
      }
    }
  }

  /* ---------------------------------------------------------------- */
  /* Git status                                                       */
  /* ---------------------------------------------------------------- */

  const branch = await git.getCurrentBranch();

  console.log(` ${chalk.dim("Branch".padEnd(12))} ${chalk.blue(branch)}`);

  const status = await git.getStatus();

  if (status.conflicted.length > 0) {
    console.log();

    spinner.warn(
      chalk.red(`${status.conflicted.length} file(s) have merge conflicts:`),
    );

    for (const file of status.conflicted) {
      console.log(`  ${chalk.red("×")} ${file}`);
    }

    showHeader({
      title: "Resolve conflicts before committing.",
      color: chalk.red,
      symbol: "error",
      type: "outro",
    });

    return;
  }

  if (status.changed === 0) {
    showHeader({
      title: "No changes to commit.",
      color: chalk.yellow,
      symbol: "info",
      type: "outro",
    });

    return;
  }

  console.log(
    ` ${chalk.dim("Changes".padEnd(12))} ${chalk.cyan(status.changed)} file${
      status.changed === 1 ? "" : "s"
    } changed`,
  );

  /* ---------------------------------------------------------------- */
  /* Commit message / provider context                                */
  /* ---------------------------------------------------------------- */

  let message = options.customMessage?.trim();

  if (options.customMessage !== undefined && !message) {
    showHeader({
      title: "Commit cancelled. The message cannot be empty.",
      color: chalk.yellow,
      symbol: "warning",
      type: "outro",
    });

    return;
  }

  let config = await getConfig();

  /*
   * A custom message doesn't need PushAI configuration.
   * Configuration is only required when generating/regenerating.
   */
  if (!message) {
    if (!config) {
      return;
    }

    const active = config.providers.find(
      (provider) => provider.id === config?.activeId,
    );

    if (!active) {
      showHeader({
        title: "No active provider configured. Run `pai setup`.",
        color: chalk.yellow,
        symbol: "warning",
        type: "outro",
      });

      return;
    }

    console.log(
      ` ${chalk.dim("Using".padEnd(12))} ${chalk.yellow(
        formatProvider(active),
      )}`,
    );
  }

  /* ---------------------------------------------------------------- */
  /* Stage changes                                                    */
  /* ---------------------------------------------------------------- */

  console.log();

  await git.stageAll();

  const diff = await git.getDiff();

  if (!diff.trim()) {
    showHeader({
      title: "No staged changes to commit.",
      color: chalk.yellow,
      symbol: "info",
      type: "outro",
    });

    return;
  }

  /* ---------------------------------------------------------------- */
  /* Generate commit message                                          */
  /* ---------------------------------------------------------------- */

  if (!message) {
    const shouldGenerate = await confirm({
      message: "Generate a commit message?",
      default: true,
    });

    if (!shouldGenerate) {
      showHeader({
        title: "Commit cancelled.",
        color: chalk.dim,
        symbol: "info",
        type: "outro",
      });

      return;
    }

    try {
      spinner.start("Generating..");

      message = await generateCommitMessage(config as SetupConfig, diff);

      spinner.succeed("Commit message generated.");
    } catch (error) {
      spinner.fail(
        error instanceof Error
          ? error.message
          : "Failed to generate commit message.",
      );

      showHeader({
        title: "Commit cancelled.",
        color: chalk.red,
        symbol: "error",
        type: "outro",
      });

      return;
    }
  }

  /* ---------------------------------------------------------------- */
  /* Dry run                                                          */
  /* ---------------------------------------------------------------- */

  console.log();
  showCommitMessage(message);

  if (options.dryRun) {
    showHeader({
      title: `Dry run completed on ${branch}.`,
      color: chalk.blue,
      symbol: "flag",
      type: "outro",
    });

    return;
  }

  /* ---------------------------------------------------------------- */
  /* Commit action loop                                               */
  /* ---------------------------------------------------------------- */

  while (true) {
    const active = config?.providers.find(
      (provider) => provider.id === config?.activeId,
    );

    const isLocal = active?.mode === "local";

    console.log();

    const action = await select({
      message: "What should we do with this commit?",
      choices: [
        {
          name: isLocal ? "Commit locally" : "Commit & push",
          value: "accept",
          description: isLocal
            ? "Create the commit locally — push it whenever you're online"
            : "Create the commit and push it to the remote",
        },
        {
          name: "Edit message",
          value: "edit",
          description: "Modify the commit message",
        },
        {
          name: "Regenerate",
          value: "regenerate",
          description: "Generate a new AI commit message",
        },
        {
          name: "Cancel",
          value: "cancel",
          description: "Abort without creating the commit",
        },
      ],
    });

    switch (action) {
      case "accept":
        break;

      case "edit": {
        const editedMessage = await input({
          message: "Update the commit message:",
          default: message,
          validate: (value) =>
            value.trim() ? true : "Commit message cannot be empty.",
        });

        message = editedMessage.trim();

        console.log();
        showCommitMessage(message);

        continue;
      }

      case "regenerate": {
        if (!config) {
          config = await getConfig();
        }

        if (!config) {
          return;
        }

        try {
          const active = config.providers.find(
            (provider) => provider.id === config?.activeId,
          );

          if (!active) {
            showHeader({
              title: "No active provider configured. Run `pai setup`.",
              color: chalk.yellow,
              symbol: "warning",
              type: "outro",
            });

            return;
          }

          spinner.start("Regenerating..");

          message = await generateCommitMessage(config, diff, true);

          spinner.succeed("New commit message generated.");

          console.log();
          showCommitMessage(message);
        } catch (error) {
          spinner.fail(
            error instanceof Error
              ? error.message
              : "Failed to regenerate commit message.",
          );

          console.log();
        }

        continue;
      }

      case "cancel":
        showHeader({
          title: "Commit cancelled.",
          color: chalk.dim,
          symbol: "info",
          type: "outro",
        });

        return;
    }

    break;
  }

  /* ---------------------------------------------------------------- */
  /* Commit                                                           */
  /* ---------------------------------------------------------------- */

  const activeAtCommit = config?.providers.find(
    (provider) => provider.id === config?.activeId,
  );

  const isLocalCommit = activeAtCommit?.mode === "local";

  await git.commit(message);

  /* ---------------------------------------------------------------- */
  /* Local-only: never try to push                                    */
  /* ---------------------------------------------------------------- */

  if (isLocalCommit) {
    showHeader({
      title: `Created on ${branch}. Push when online with \`git push\`.`,
      color: chalk.green,
      symbol: "success",
      type: "outro",
    });

    return;
  }

  /* ---------------------------------------------------------------- */
  /* Remote                                                           */
  /* ---------------------------------------------------------------- */

  if (!(await git.hasRemote())) {
    showHeader({
      title: `Commit created on ${branch}, but no remote named 'origin' was found.`,
      color: chalk.yellow,
      symbol: "warning",
      type: "outro",
    });

    return;
  }

  /* ---------------------------------------------------------------- */
  /* Push                                                             */
  /* ---------------------------------------------------------------- */

  spinner.start("Pushing to GitHub..");

  try {
    await git.push(branch);

    spinner.succeed("Pushed to GitHub.");
  } catch (error) {
    spinner.fail(
      error instanceof Error ? error.message : "Failed to push commit.",
    );

    showHeader({
      title: `Commit created on ${branch}, but push failed.`,
      color: chalk.yellow,
      symbol: "warning",
      type: "outro",
    });

    return;
  }

  showHeader({
    title: `Commit created and pushed to ${branch}.`,
    color: chalk.green,
    symbol: "success",
    type: "outro",
  });
}
