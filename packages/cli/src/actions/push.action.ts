import { createGitService } from "@pushai/core";
import { showHeader, spinner } from "@pushai/utils";
import chalk from "chalk";
import type { Command } from "commander";
import {
  handleCheckConflicts,
  handleEnsureRepo,
} from "../handlers/git-setup.handler";
import { getCommandTitle } from "../lib/command-title";

export async function pushAction(command?: Command) {
  const { commandTitle, baseCommand } = getCommandTitle(command);

  showHeader({
    title: commandTitle,
    color: chalk.blue,
    symbol: "flag",
    type: "intro",
  });

  // 1. Ensure Repository Exists
  const repoState = await handleEnsureRepo(baseCommand);
  if (!repoState.isRepo) return;

  // 2. Check Conflicts
  const hasConflicts = await handleCheckConflicts();
  if (hasConflicts) return;

  const git = createGitService();

  // Check for uncommitted local changes
  const status = await git.getStatus();
  if (status.changed > 0) {
    spinner.warn(
      `you have ${chalk.yellow(status.changed)} uncommitted change${
        status.changed === 1 ? "" : "s"
      }.`,
    );
  }

  const branch = repoState.branch;
  const unpushed = await git.getUnpushedCount(branch);

  if (unpushed === 0) {
    showHeader({
      title: `nothing to push. ${branch} is already up to date with origin.`,
      color: chalk.green,
      symbol: "success",
      type: "outro",
      margin: { top: status.changed > 0 },
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
