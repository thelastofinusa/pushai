import { confirm, Separator, select } from "@inquirer/prompts";
import { headerIcons, showHeader } from "@pushai/utils";
import chalk from "chalk";
import type { Command } from "commander";
import { configStore } from "../config/store.config";
import { handleEnsureConfig } from "../handlers/config.helper";
import { getCommandTitle } from "../lib/command-title";
import { formatProvider } from "../lib/format";

async function resetAll() {
  const proceed = await confirm({
    message: "are you sure you want to delete all configuration?",
    default: false,
  });

  if (!proceed) {
    cancelReset();
    return;
  }

  const deleted = await configStore.resetStoredConfig();

  showHeader({
    title: deleted ? "all configurations deleted." : "nothing to delete.",
    color: deleted ? chalk.green : chalk.yellow,
    symbol: deleted ? "success" : "warning",
    type: "outro",
  });
}

function cancelReset() {
  showHeader({
    title: "reset cancelled. configuration untouched.",
    color: chalk.dim,
    symbol: "info",
    type: "outro",
  });
}

export async function resetAction(
  options: { all?: boolean },
  command?: Command,
) {
  const { commandTitle } = getCommandTitle(command);

  // Intro Header: Red for destructive operations
  showHeader({
    title: commandTitle,
    color: chalk.redBright,
  });

  const config = await handleEnsureConfig("red");
  if (typeof config === "boolean") return config;

  // --all skips the configuration check and selection menu.
  if (options.all) {
    await resetAll();
    return;
  }

  const choice = await select({
    message: "what would you like to remove?",
    choices: [
      ...config.providers.map((p) => {
        const isActive = p.id === config.activeId;
        const tag = isActive
          ? chalk.yellowBright(` ${headerIcons.chevron} active`)
          : "";

        return {
          name: `${formatProvider(p, true)}${tag}`,
          value: `provider:${p.id}`,
          description: `Remove ${formatProvider(p)} from configured providers`,
        };
      }),
      new Separator(),
      {
        name: chalk.redBright("delete all providers"),
        value: "all",
        description: "Purge every provider configuration and API key",
      },
      {
        name: "preserve current configuration",
        value: "cancel",
        description: "Exit reset menu without removing any providers or keys",
      },
    ],
  });

  if (choice === "cancel") {
    cancelReset();
    return;
  }

  if (choice === "all") {
    await resetAll();
    return;
  }

  const id = choice.replace("provider:", "");
  const provider = config.providers.find((p) => p.id === id);

  if (!provider) return;

  const proceed = await confirm({
    message: `remove ${chalk.redBright(formatProvider(provider))}?`,
    default: false,
  });

  if (!proceed) {
    cancelReset();
    return;
  }

  const deleted = await configStore.removeProvider(id);

  showHeader({
    title: deleted
      ? `"${formatProvider(provider)}" provider removed.`
      : "failed to remove provider.",
    color: deleted ? chalk.green : chalk.red,
    symbol: deleted ? "success" : "error",
    type: "outro",
  });
}
