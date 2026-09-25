import {
  checkForUpdateFresh,
  getPackageManager,
  showHeader,
} from "@pushai/utils";
import chalk from "chalk";
import { pkgConfig } from "../../config/config.config";
import { spinner } from "../../lib/spinner";

export async function runUpdate() {
  showHeader({
    title: "Check for PushAI updates",
    color: chalk.cyan,
    symbol: "gear",
    type: "intro",
  });

  const pm = getPackageManager();

  spinner.start("Checking npm registry..");

  const info = await checkForUpdateFresh(pkgConfig.name, pkgConfig.version);

  spinner.stop();

  console.log(
    ` ${chalk.dim("Current".padEnd(12))} ${chalk.white(info.current)}`,
  );
  console.log(` ${chalk.dim("Latest".padEnd(12))} ${chalk.white(info.latest)}`);

  if (!info.outdated) {
    showHeader({
      title: `You're on the latest version (${info.current}).`,
      color: chalk.green,
      symbol: "success",
      type: "outro",
    });
    return;
  }

  showHeader({
    title: `Update available: ${info.current} → ${info.latest}`,
    color: chalk.yellow,
    symbol: "warning",
    type: "outro",
  });

  console.log(
    ` ${chalk.dim("Run")} ${chalk.cyan(`${pm.installer} -g ${pkgConfig.name}`)}`,
  );
  console.log();
}
