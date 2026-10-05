import { headerIcons, showHeader } from "@pushai/utils";
import chalk from "chalk";
import type { Command } from "commander";
import { handleEnsureConfig } from "../handlers/config.helper";
import { getCommandTitle } from "../lib/command-title";
import { formatProvider } from "../lib/format";

export async function peakAction(
  options: { withApiKey?: boolean },
  command?: Command,
) {
  const { baseCommand, commandTitle } = getCommandTitle(command);

  showHeader({
    title: commandTitle,
    color: chalk.cyan,
  });

  const config = await handleEnsureConfig("cyan");
  if (typeof config === "boolean") return config;

  console.log();
  let hasByok = false;

  for (const p of config.providers) {
    const isActive = p.id === config.activeId;
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

  return config;
}
