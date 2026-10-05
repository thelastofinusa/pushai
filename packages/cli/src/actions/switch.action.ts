import { Separator, select } from "@inquirer/prompts";
import { headerIcons, showHeader } from "@pushai/utils";
import chalk from "chalk";
import type { Command } from "commander";
import { configStore } from "../config/store.config";
import { handleEnsureConfig } from "../handlers/config.helper";
import { getCommandTitle } from "../lib/command-title";
import { formatProvider } from "../lib/format";

export async function switchAction(command?: Command) {
  const { commandTitle } = getCommandTitle(command);

  showHeader({
    title: commandTitle,
    color: chalk.yellow,
  });

  const config = await handleEnsureConfig("yellow");
  if (typeof config === "boolean") return config;

  const nextId = await select({
    message: "choose active provider:",
    choices: [
      ...config.providers.map((p) => {
        const isActive = p.id === config.activeId;

        return {
          name: `${formatProvider(p, true)}${isActive ? chalk.yellowBright(` ${headerIcons.chevron} active`) : ""}`,
          value: p.id,
          description: isActive
            ? "Currently selected"
            : `Switch to ${p.mode === "byok" ? p.provider : p.mode}`,
        };
      }),
      new Separator(),
      {
        name: "keep active provider",
        value: "cancel",
        description: "Exit menu without switching your current provider mode",
      },
    ],
  });

  if (nextId === "cancel") {
    showHeader({
      title: "switch cancelled. active provider unchanged.",
      color: chalk.dim,
      symbol: "info",
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

  const target = config.providers.find((p) => p.id === nextId);

  showHeader({
    title: `switched to "${target ? formatProvider(target) : nextId}".`,
    color: chalk.green,
    symbol: "success",
    type: "outro",
  });
}
