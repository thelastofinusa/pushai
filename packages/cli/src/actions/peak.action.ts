import { confirm } from "@inquirer/prompts";
import {
  headerIcons,
  setSpinnerColor,
  showHeader,
  sleep,
  spinner,
} from "@pushai/utils";
import chalk from "chalk";
import type { Command } from "commander";
import { configStore } from "../config/store.config";
import { getCommandTitle } from "../lib/command-title";
import { formatProvider } from "../lib/format";
import { setupAction } from "./setup.action";

export async function peakAction(
  options: { withApiKey?: boolean },
  command?: Command,
) {
  const { baseCommand, commandTitle } = getCommandTitle(command);

  showHeader({
    title: commandTitle,
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

    await setupAction();

    return true;
  }

  spinner.succeed("configuration loaded");

  console.log();
  let hasByok = false;

  for (const p of savedConfig.providers) {
    const isActive = p.id === savedConfig.activeId;
    const tag = isActive ? chalk.dim(` ${headerIcons.dot} active`) : "";

    console.log(`  ${formatProvider(p, true)}${tag}`);

    if (p.mode === "byok") {
      hasByok = true;

      if (options.withApiKey) {
        console.log(`    ${chalk.dim("api key")}`);
        console.log(`      ${chalk.cyan(p.apiKey)}`);
      } else {
        console.log(`    ${chalk.dim("api key configured")}`);
      }
    }
  }

  if (hasByok && !options.withApiKey) {
    console.log();

    console.log(
      ` ${chalk.dim("Use")} ${chalk.cyan(
        `${baseCommand} --key`,
      )} ${chalk.dim("to show the configured API keys.")}`,
    );
  }

  showHeader({
    title: options.withApiKey
      ? "configuration and api keys loaded."
      : "configuration loaded successfully.",
    color: chalk.green,
    type: "outro",
    exitType: 0,
  });

  return savedConfig;
}
