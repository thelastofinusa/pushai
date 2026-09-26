import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { confirm } from "@inquirer/prompts";
import {
  checkForUpdateFresh,
  getCliCommand,
  getPackageManager,
  headerIcons,
  showHeader,
  spinner,
} from "@pushai/utils";
import chalk from "chalk";
import { pkgConfig } from "../config/config.config";

const execFileAsync = promisify(execFile);

export async function updateAction(action: string) {
  const pm = getPackageManager();
  const command = getCliCommand();

  showHeader({
    title: `${command} ${action} - v${pkgConfig.version}`,
    color: chalk.cyan,
    symbol: "gear",
  });

  spinner.start("checking npm registry..");

  const info = await checkForUpdateFresh(pkgConfig.name, pkgConfig.version);

  if (!info.outdated) {
    spinner.succeed("already up to date");

    console.log();
    console.log(
      `   ${chalk.dim("current".padEnd(12))} ${chalk.white(info.current)}`,
    );
    console.log(
      `   ${chalk.dim("latest".padEnd(12))} ${chalk.white(info.latest)}`,
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

  spinner.succeed(
    `update available: ${info.current} ${headerIcons.chevron} ${info.latest}`,
  );

  console.log();
  console.log(
    `   ${chalk.dim("current".padEnd(12))} ${chalk.white(info.current)}`,
  );
  console.log(
    `   ${chalk.dim("latest".padEnd(12))} ${chalk.white(info.latest)}`,
  );
  console.log();

  const shouldUpdate = await confirm({
    message: `update ${pkgConfig.name} to v${info.latest} now?`,
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
