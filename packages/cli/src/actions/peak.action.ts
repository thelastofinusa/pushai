import { showHeader, spinner } from "@pushai/utils";
import chalk from "chalk";
import type { Command } from "commander";
import { handleEnsureConfig } from "../handlers/config.helper";
import { getCommandTitle } from "../lib/command-title";
import { showProviders } from "../lib/show";

export async function peakAction(
  options: { withApiKey?: boolean },
  command?: Command,
) {
  const { baseCommand, commandTitle } = getCommandTitle(command);

  showHeader({
    title: commandTitle,
    color: chalk.magenta,
  });

  const config = await handleEnsureConfig("magenta");
  if (typeof config === "boolean") return config;

  const { hasByok } = showProviders({
    providers: config.providers,
    activeId: config.activeId,
    withApiKey: options.withApiKey,
    color: chalk.magenta,
  });

  if (hasByok && !options.withApiKey) {
    console.log();
    spinner.info(
      `Use ${chalk.cyan(`${baseCommand} --key`)} to show the configured API keys`,
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

  return config;
}
