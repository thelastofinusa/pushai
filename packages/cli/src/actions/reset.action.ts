import { confirm, Separator, select } from "@inquirer/prompts";
import { showHeader } from "@pushai/utils";
import chalk from "chalk";
import type { Command } from "commander";
import { configStore } from "../config/store.config";
import { handleEnsureConfig } from "../handlers/config.helper";
import { getCommandTitle } from "../lib/command-title";
import { formatProvider } from "../lib/format";

async function resetAll() {
  const proceed = await confirm({
    message: "are you sure you want to delete all?",
    default: false,
  });

  if (!proceed) {
    showHeader({
      title: "reset cancelled.",
      color: chalk.dim,
      symbol: "arrow",
      type: "outro",
    });
    return;
  }

  const deleted = await configStore.resetStoredConfig();

  showHeader({
    title: deleted ? "pushai configuration deleted." : "nothing to delete.",
    color: deleted ? chalk.green : chalk.yellow,
    symbol: deleted ? "success" : "warning",
    type: "outro",
  });
}

function cancelReset() {
  showHeader({
    title: "reset cancelled.",
    color: chalk.dim,
    symbol: "arrow",
    type: "outro",
  });
}

export async function resetAction(
  options: { all?: boolean },
  command?: Command,
) {
  const { commandTitle } = getCommandTitle(command);

  showHeader({
    title: commandTitle,
    color: chalk.redBright,
  });

  // --all skips the configuration check and selection menu.
  if (options.all) {
    await resetAll();
    return;
  }

  const config = await handleEnsureConfig("red");
  if (typeof config === "boolean") return config;

  const choice = await select({
    message: "what would you like to reset?",
    choices: [
      new Separator(),

      ...config.providers.map((p) => {
        const isActive = p.id === config.activeId;

        return {
          name: `${formatProvider(p)}${isActive ? chalk.dim(" (active)") : ""}`,
          value: `provider:${p.id}`,
        };
      }),

      new Separator(),

      {
        name: "delete all providers",
        value: "all",
        description: "Delete every provider and stored API key",
      },
      {
        name: "keep configuration",
        value: "cancel",
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
    message: `remove ${chalk.redBright(provider.mode)} provider?`,
    default: false,
  });

  if (!proceed) {
    cancelReset();
    return;
  }

  const deleted = await configStore.removeProvider(id);

  showHeader({
    title: deleted ? `"${id}" provider removed.` : "failed to remove provider.",
    color: deleted ? chalk.green : chalk.red,
    symbol: deleted ? "success" : "error",
    type: "outro",
  });
}
