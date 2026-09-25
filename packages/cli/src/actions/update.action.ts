import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  checkForUpdateFresh,
  getCliCommand,
  getPackageManager,
  showHeader,
  sleep,
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

  spinner.succeed(`update available: ${info.current} → ${info.latest}`);

  console.log();
  console.log(
    `   ${chalk.dim("current".padEnd(12))} ${chalk.white(info.current)}`,
  );
  console.log(
    `   ${chalk.dim("latest".padEnd(12))} ${chalk.white(info.latest)}`,
  );
  console.log();

  spinner.start(`updating ${pkgConfig.name}..`);
  await sleep();

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
