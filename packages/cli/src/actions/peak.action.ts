import { showHeader } from "@pushai/utils";
import chalk from "chalk";
import type { Command } from "commander";
import { handleEnsureConfig } from "../handlers/config.helper";
import { getCommandTitle } from "../lib/command-title";
import { formatProvider } from "../lib/format";
import { showProviders } from "../lib/show";

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

  let hasByok = false;

  const providerList = config.providers.map((p) => {
    const isActive = p.id === config.activeId;
    let apiKeyInfo: string | undefined;

    if (p.mode === "byok") {
      hasByok = true;
      if (options.withApiKey) {
        apiKeyInfo = p.apiKey;
      } else {
        apiKeyInfo = "api key configured";
      }
    }

    return {
      id: p.id,
      mode: p.mode,
      label: formatProvider(p, true),
      isActive,
      apiKeyInfo,
    };
  });

  showProviders(providerList);

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
