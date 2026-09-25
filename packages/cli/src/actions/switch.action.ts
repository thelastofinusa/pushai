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

export async function switchAction(action: string) {
  const command = getCliCommand();

  showHeader({
    title: `${command} ${action} - v${pkgConfig.version}`,
    color: chalk.green,
  });

  setSpinnerColor("green");
  spinner.start("retrieving configuration");

  const existingConfig = await configStore.getStoredConfig();
  await sleep(400);

  if (!existingConfig) {
    spinner.warn("no configuration found");

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

  const nextId = await select({
    message: "which provider should become active?",
    choices: [
      new Separator(),
      ...existingConfig.providers.map((p) => {
        const isActive = p.id === existingConfig.activeId;

        return {
          name: `${formatProvider(p)}${isActive ? chalk.dim(" (active)") : ""}`,
          value: p.id,
          description: isActive
            ? "Currently selected"
            : `Switch to ${p.mode === "byok" ? p.provider : p.mode}`,
        };
      }),
      new Separator(),
      {
        name: "keep configuration",
        value: "cancel",
      },
    ],
  });

  if (nextId === "cancel") {
    showHeader({
      title: "switch cancelled.",
      color: chalk.dim,
      symbol: "arrow",
      type: "outro",
    });
    return;
  }

  const switched = await configStore.setActiveProvider(nextId);

  if (!switched) {
    showHeader({
      title: "failed to switch provider.",
      color: chalk.red,
      symbol: "error",
      type: "outro",
    });

    return;
  }

  const target = existingConfig.providers.find((p) => p.id === nextId);

  showHeader({
    title: `switched to "${target ? formatProvider(target) : nextId}".`,
    color: chalk.green,
    symbol: "success",
    type: "outro",
  });
}
