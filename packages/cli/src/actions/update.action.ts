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
import { showTree } from "../lib/show";

const execFileAsync = promisify(execFile);

export async function updateAction(command?: Command) {
  const pm = getPackageManager();
  const { commandTitle } = getCommandTitle(command);

  showHeader({
    title: commandTitle,
    color: chalk.cyan,
    symbol: "gear",
  });

  setSpinnerColor("cyan");
  spinner.start("checking npm registry..");

  const info = await checkForUpdateFresh(pkgConfig.name, pkgConfig.version);

  // Clean tree formatting for version display
  const renderVersionTree = () => {
    showTree({
      headerTitle: "version status",
      items: [
        {
          title: `latest:     v${info.latest}`,
          description: `installed:  v${info.current}`,
        },
      ],
      color: info.outdated ? chalk.yellow : chalk.cyan,
    });
  };

  if (!info.outdated) {
    spinner.succeed("already up to date");

    console.log();
    renderVersionTree();
    console.log();

    showHeader({
      title: `you're on the latest version (v${info.current}).`,
      color: chalk.green,
      symbol: "success",
      type: "outro",
      margin: { top: false },
    });

    return;
  }

  spinner.succeed(`new version found ${headerIcons.chevron} v${info.latest}`);

  console.log();
  renderVersionTree();
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

    spinner.succeed(`updated ${pkgConfig.name} to v${info.latest}`);

    showHeader({
      title: "successfully updated.",
      color: chalk.green,
      symbol: "success",
      type: "outro",
    });
  } catch (error) {
    spinner.fail(`failed to update ${pkgConfig.name}.`);

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
