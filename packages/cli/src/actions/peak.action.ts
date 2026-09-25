import { confirm } from "@inquirer/prompts";
import {
  getCliCommand,
  setSpinnerColor,
  showHeader,
  sleep,
  spinner,
} from "@pushai/utils";
import chalk from "chalk";
import { pkgConfig } from "../config/config.config";
import { configStore } from "../config/store.config";
import { formatProvider } from "../lib/format";

export async function peakAction(
  action: string,
  withApiKey = false,
  key?: string,
) {
  const command = getCliCommand();

  showHeader({
    title: `${command} ${action}${withApiKey ? ` ${key}` : ""} - v${pkgConfig.version}`,
    color: chalk.cyan,
  });

  setSpinnerColor("cyan");
  spinner.start("loading saved configuration");

  const savedConfig = await configStore.getStoredConfig();
  await sleep(400);

  if (!savedConfig) {
    spinner.warn("no saved configuration");

    console.log();
    const proceed = await confirm({
      message: "would you like to start the setup wizard?",
      default: true,
    });

    if (!proceed) {
      showHeader({
        title: "setup wizard skipped.",
        symbol: "info",
        color: chalk.dim,
        type: "outro",
      });
      return false;
    }

    const { setupAction } = await import("./setup.action");
    await setupAction("setup");

    return true;
  }

  spinner.succeed("configuration loaded");

  console.log();
  let hasByok = false;

  for (const p of savedConfig.providers) {
    const isActive = p.id === savedConfig.activeId;

    const label = isActive
      ? chalk.bgMagenta(formatProvider(p))
      : formatProvider(p);

    const tag = isActive ? chalk.dim(" (active)") : "";

    console.log(`  ${label}${tag}`);

    if (p.mode === "byok") {
      hasByok = true;

      const keyDisplay = withApiKey
        ? chalk.cyan(p.apiKey)
        : chalk.dim(
            `${chalk.dim("api key -")} ${p.apiKey.slice(0, 4)}...${p.apiKey.slice(-4)}`,
          );

      console.log(`    ${keyDisplay}`);
    }
  }

  if (hasByok && !withApiKey) {
    console.log();

    console.log(
      ` ${chalk.dim("Use")} ${chalk.cyan(
        `${command} ${action} ${key}`,
      )} ${chalk.dim("to show the configured API keys.")}`,
    );
  }

  showHeader({
    title: "configuration loaded successfully.",
    color: chalk.green,
    type: "outro",
    exitType: 0,
  });

  return savedConfig;
}
