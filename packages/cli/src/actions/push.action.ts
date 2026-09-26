import { createGitService } from "@pushai/core";
import {
  getCliCommand,
  setSpinnerColor,
  showHeader,
  spinner,
} from "@pushai/utils";
import chalk from "chalk";
import { pkgConfig } from "../config/config.config";

export async function pushAction(action: string) {
  const command = getCliCommand();

  showHeader({
    title: `${command} ${action} - v${pkgConfig.version}`,
    color: chalk.cyan,
    symbol: "flag",
    type: "intro",
  });

  setSpinnerColor("cyan");

  const git = createGitService();

  if (!(await git.isRepo())) {
    spinner.fail("no git repository found in this directory.");
    return;
  }

  const branch = await git.getCurrentBranch();
  const unpushed = await git.getUnpushedCount(branch);

  if (unpushed === 0) {
    showHeader({
      title: `nothing to push. ${branch} is already up to date with origin.`,
      color: chalk.green,
      symbol: "success",
      type: "outro",
      margin: { top: false },
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
