import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { confirm } from "@inquirer/prompts";
import {
  checkForUpdateFresh,
  getPackageManager,
  headerIcons,
  setSpinnerColor,
  showHeader,
  spinner,
} from "@pushai/utils";
import chalk from "chalk";
import type { Command } from "commander";
import { pkgConfig } from "../config/config.config";
import { getCommandTitle } from "../lib/command-title";

const execFileAsync = promisify(execFile);

export async function updateAction(command?: Command) {
  const pm = getPackageManager();

  const { commandTitle } = getCommandTitle(command);

  showHeader({
    title: commandTitle,
    color: chalk.yellow,
    symbol: "gear",
  });

  setSpinnerColor("yellow");
  spinner.start("checking npm registry..");

  const info = await checkForUpdateFresh(pkgConfig.name, pkgConfig.version);

  if (!info.outdated) {
    spinner.succeed("already up to date");

    console.log();
    console.log(
      `   ${chalk.dim("installed".padEnd(12))} ${chalk.white(`v${info.current}`)}`,
    );
    console.log(
      `   ${chalk.dim("available".padEnd(12))} ${chalk.white(`v${info.latest}`)}`,
    );
    console.log();

    showHeader({
      title: `you're on the latest version (${info.current}).`,
      color: chalk.green,
      symbol: "success",
      type: "outro",
      margin: { top: false },
    });

    return;
  }

  spinner.succeed(`new version found ${headerIcons.chevron} v${info.latest}`);

  console.log();
  console.log(
    `   ${chalk.dim("installed".padEnd(12))} ${chalk.white(`v${info.current}`)}`,
  );
  console.log(
    `   ${chalk.dim("available".padEnd(12))} ${chalk.white(`v${info.latest}`)}`,
  );
  console.log();

  const shouldUpdate = await confirm({
    message: `upgrade to the latest version (v${info.latest})?`,
    default: true,
  });

  if (!shouldUpdate) {
    showHeader({
      title: "update skipped.",
      color: chalk.dim,
      symbol: "info",
      type: "outro",
    });

    return;
  }

  spinner.start(`installing ${pkgConfig.name}@${info.latest}..`);

  try {
    const [executable, ...args] = pm.installer.split(" ");

    await execFileAsync(executable, [
      ...args,
      "-g",
      `${pkgConfig.name}@${info.latest}`,
    ]);

    spinner.succeed(`updated ${pkgConfig.name} to ${info.latest}`);

    showHeader({
      title: `successfully updated.`,
      color: chalk.green,
      symbol: "success",
      type: "outro",
    });
  } catch (error) {
    spinner.fail("failed to update pushai.");

    const message =
      error instanceof Error ? error.message : "unknown update error.";

    showHeader({
      title: message,
      color: chalk.red,
      symbol: "error",
      type: "outro",
      exitType: 1,
    });
  }
}
