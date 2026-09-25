import { confirm, Separator, select } from "@inquirer/prompts";
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

export async function resetAction(action: string) {
  const command = getCliCommand();

  showHeader({
    title: `${command} ${action} - v${pkgConfig.version}`,
    color: chalk.redBright,
  });

  setSpinnerColor("yellow");
  spinner.start("checking existing configuration");

  const existingConfig = await configStore.getStoredConfig();
  await sleep(400);

  if (!existingConfig) {
    spinner.warn("no existing configuration");

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

  spinner.succeed("configuration retrieved");

  const choice = await select({
    message: "what would you like to reset?",
    choices: [
      new Separator(),

      ...existingConfig.providers.map((p) => {
        const isActive = p.id === existingConfig.activeId;

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
    showHeader({
      title: "reset cancelled.",
      color: chalk.dim,
      symbol: "arrow",
      type: "outro",
    });
    return;
  }

  if (choice === "all") {
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

    return;
  }

  const id = choice.replace("provider:", "");
  const provider = existingConfig.providers.find((p) => p.id === id);

  if (!provider) return;

  const proceed = await confirm({
    message: `remove ${chalk.redBright(provider.mode)} provider?`,
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

  const deleted = await configStore.removeProvider(id);

  showHeader({
    title: deleted ? `"${id}" provider removed.` : "failed to remove provider.",
    color: deleted ? chalk.green : chalk.red,
    symbol: deleted ? "success" : "error",
    type: "outro",
  });
}
