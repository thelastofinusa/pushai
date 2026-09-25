import { confirm, select } from "@inquirer/prompts";
import { showHeader } from "@pushai/utils";
import chalk from "chalk";
import { getConfig } from "../../config/store.config";
import { formatProvider } from "../../lib/format";
import { configStore } from "../../lib/store";

export async function runReset() {
  showHeader({
    title: "Reset PushAI Configuration",
    color: chalk.cyan,
    symbol: "gear",
    type: "intro",
  });

  const config = await getConfig();

  if (!config) return;

  const choice = await select({
    message: "What would you like to reset?",
    choices: [
      ...config.providers.map((p) => ({
        name: `${formatProvider(p)}${p.id === config.activeId ? chalk.cyan(" • active") : ""}`,
        value: `provider:${p.id}`,
      })),
      {
        name: chalk.red("Delete all providers"),
        value: "all",
        description: "Delete every provider and stored API key",
      },
      {
        name: "Cancel",
        value: "cancel",
      },
    ],
  });

  if (choice === "cancel") {
    showHeader({
      title: "Reset cancelled.",
      color: chalk.dim,
      symbol: "arrow",
      type: "outro",
    });
    return;
  }

  if (choice === "all") {
    const proceed = await confirm({
      message: "Delete every saved provider and API key?",
      default: false,
    });

    if (!proceed) {
      showHeader({
        title: "Reset cancelled.",
        color: chalk.dim,
        symbol: "arrow",
        type: "outro",
      });
      return;
    }

    const deleted = await configStore.resetStoredConfig();

    showHeader({
      title: deleted ? "PushAI configuration deleted." : "Nothing to delete.",
      color: deleted ? chalk.green : chalk.yellow,
      symbol: deleted ? "success" : "warning",
      type: "outro",
    });

    return;
  }

  const id = choice.replace("provider:", "");

  const provider = config.providers.find((p) => p.id === id);

  if (!provider) {
    return;
  }

  const proceed = await confirm({
    message: `Remove ${chalk.red(formatProvider(provider))}?`,
    default: false,
  });

  if (!proceed) {
    showHeader({
      title: "Reset cancelled.",
      color: chalk.dim,
      symbol: "arrow",
      type: "outro",
    });
    return;
  }

  const deleted = await configStore.removeProvider(id);

  showHeader({
    title: deleted ? `Provider "${id}" removed.` : "Failed to remove provider.",
    color: deleted ? chalk.green : chalk.red,
    symbol: deleted ? "success" : "error",
    type: "outro",
  });
}
