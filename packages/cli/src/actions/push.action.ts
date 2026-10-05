import { createGitService } from "@pushai/core";
import { showHeader, spinner } from "@pushai/utils";
import chalk from "chalk";
import type { Command } from "commander";
import { getCommandTitle } from "../lib/command-title";

export async function pushAction(command?: Command) {
  const { commandTitle } = getCommandTitle(command);

  showHeader({
    title: commandTitle,
    color: chalk.cyan,
    symbol: "flag",
    type: "intro",
  });

  const git = createGitService();

  if (!(await git.isRepo())) {
    spinner.fail("no git repository found in this directory.");
    return;
  }

  // Check for uncommitted local changes
  const status = await git.getStatus();
  if (status.changed > 0) {
    spinner.warn(
      `you have ${chalk.yellow(status.changed)} uncommitted change${
        status.changed === 1 ? "" : "s"
      }.`,
    );
  }

  const branch = await git.getCurrentBranch();
  const unpushed = await git.getUnpushedCount(branch);

  if (unpushed === 0) {
    showHeader({
      title: `nothing to push. ${branch} is already up to date with origin.`,
      color: chalk.green,
      symbol: "success",
      type: "outro",
      // biome-ignore lint/complexity/noUselessTernary: ignore this ternary for clarity
      margin: { top: status.changed > 0 ? true : false },
    });

    return;
  }

  if (unpushed === null && !(await git.hasRemote())) {
    showHeader({
      title: "no remote named 'origin' was found.",
      color: chalk.yellow,
      symbol: "warning",
      type: "outro",
    });

    return;
  }

  spinner.start(
    unpushed === null
      ? `publishing ${chalk.cyan(branch)} to origin..`
      : `pushing ${chalk.cyan(`${unpushed} commit${unpushed === 1 ? "" : "s"}`)} to origin/${branch}..`,
  );

  try {
    await git.push(branch);

    spinner.succeed(
      unpushed === null
        ? `published ${branch} to origin`
        : `pushed ${unpushed} commit${unpushed === 1 ? "" : "s"}`,
    );

    showHeader({
      title: `${branch} is up to date with origin.`,
      color: chalk.green,
      symbol: "success",
      type: "outro",
    });
  } catch (error) {
    spinner.fail(error instanceof Error ? error.message : "failed to push.");

    showHeader({
      title: "push failed.",
      color: chalk.red,
      symbol: "error",
      type: "outro",
      exitType: 1,
    });
  }
}
