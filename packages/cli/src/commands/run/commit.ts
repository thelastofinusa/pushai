// import { select } from "@inquirer/prompts";
// import type { CommitFlowOptions } from "@pushai/types";
// import { showHeader, sleep } from "@pushai/utils";
// import chalk from "chalk";
// import { showCommitMessage } from "../../lib/messages";
// import { spinner } from "../../lib/spinner";

// export async function runCommit(_options: CommitFlowOptions = {}) {
//   showHeader({
//     title: "pai commit - v3.0.5",
//     color: chalk.cyan,
//     type: "intro",
//     symbol: "sparkle",
//   });

//   spinner.succeed(`provider ${chalk.cyan("openai:gpt-5-mini")}`);
//   spinner.start(`reading staged diff ${chalk.cyan("3 files")}`);
//   await sleep();
//   spinner.succeed(`staged diff read ${chalk.cyan("3 files")}`);
//   spinner.start(`generating commit..`);
//   await sleep();
//   spinner.succeed("commit generated");

//   showCommitMessage(
//     `feat(auth): rotate refresh tokens on session\nStore a hashed refresh token per session and issue a new
// one on every renewal. Adds coverage for reuse detection.`,
//   );

//   const action = await select({
//     message: "what should we do with this commit?",
//     choices: [
//       {
//         name: "commit & push",
//         value: "accept",
//         description: "create the commit and push it to the remote",
//       },
//       {
//         name: "edit message",
//         value: "edit",
//         description: "modify the commit message",
//       },
//       {
//         name: "regenerate",
//         value: "regenerate",
//         description: "generate a new AI commit message",
//       },
//       {
//         name: "cancel",
//         value: "cancel",
//         description: "abort without creating the commit",
//       },
//     ],
//   });

//   if (action === "accept") {
//     spinner.succeed(`committed ${chalk.green("a91f2c4")}`);
//   }

//   showHeader({
//     title: `commit created and pushed to origin/main.`,
//     color: chalk.green,
//     symbol: "success",
//     type: "outro",
//   });
// }

import { input, select } from "@inquirer/prompts";
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
    title: "pai commit",
    color: chalk.cyan,
    type: "intro",
    symbol: "sparkle",
  });

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

  let config = await getConfig();

  // a custom message skips provider config entirely
  if (!message) {
    if (!config) return;

    const active = config.providers.find((p) => p.id === config?.activeId);

    if (!active) {
      spinner.fail("no active provider configured. run `pai setup`.");
      return;
    }

    spinner.succeed(`provider ${chalk.cyan(formatProvider(active))}`);
  }

  await git.stageAll();

  const status = await git.getStatus();

  if (status.conflicted.length > 0) {
    spinner.fail(`${status.conflicted.length} file(s) have merge conflicts.`);

    for (const file of status.conflicted) {
      console.log(`  ${chalk.red("×")} ${file}`);
    }

    return;
  }

  if (status.changed === 0) {
    spinner.info("no changes to commit.");
    return;
  }

  const diff = await git.getDiff();

  spinner.succeed(
    `staged diff read ${chalk.cyan(`${status.changed} file${status.changed === 1 ? "" : "s"}`)}`,
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

  while (true) {
    const action = await select({
      message: "what should we do with this commit?",
      choices: [
        {
          name: options.autoPush ? "commit & push" : "commit",
          value: "accept",
          description: options.autoPush
            ? "create the commit and push it to the remote"
            : "create the commit locally",
        },
        {
          name: "edit message",
          value: "edit",
          description: "modify the commit message",
        },
        {
          name: "regenerate",
          value: "regenerate",
          description: "generate a new AI commit message",
        },
        {
          name: "cancel",
          value: "cancel",
          description: "abort without creating the commit",
        },
      ],
    });

    if (action === "accept") break;

    if (action === "edit") {
      message = (
        await input({
          message: "update the commit message:",
          default: message,
          validate: (value) =>
            value.trim() ? true : "commit message cannot be empty.",
        })
      ).trim();

      showCommitMessage(message);
      continue;
    }

    if (action === "regenerate") {
      if (!config) config = await getConfig();
      if (!config) return;

      const active = config.providers.find((p) => p.id === config?.activeId);

      if (!active) {
        spinner.fail("no active provider configured. run `pai setup`.");
        return;
      }

      spinner.start("regenerating..");

      try {
        message = await generateCommitMessage(config, diff, true);
        spinner.succeed("new commit message generated");
        showCommitMessage(message);
      } catch (error) {
        spinner.fail(
          error instanceof Error
            ? error.message
            : "failed to regenerate commit message.",
        );
      }

      continue;
    }

    // cancel
    showHeader({
      title: "commit cancelled.",
      color: chalk.dim,
      symbol: "info",
      type: "outro",
    });
    return;
  }

  const hash = await git.commit(message);

  spinner.succeed(`committed ${chalk.green(hash)}`);

  if (!options.autoPush) {
    showHeader({
      title: `commit created on ${branch}. push when ready with \`git push\`.`,
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

  spinner.start("pushing..");

  try {
    await git.push(branch);
    spinner.succeed("pushed");
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
    title: `commit created and pushed to origin/${branch}.`,
    color: chalk.green,
    symbol: "success",
    type: "outro",
  });
}
