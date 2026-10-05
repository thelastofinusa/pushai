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
    color: chalk.green,
  });

  const config = await handleEnsureConfig("green");
  if (typeof config === "boolean") return config;

  const nextId = await select({
    message: "which provider should become active?",
    choices: [
      new Separator(),
      ...config.providers.map((p) => {
        const isActive = p.id === config.activeId;

        const tag = isActive ? chalk.dim(` ${headerIcons.dot} active`) : "";

        return {
          name: `${formatProvider(p, true)}${tag}`,
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

  const target = config.providers.find((p) => p.id === nextId);

  showHeader({
    title: `switched to "${target ? formatProvider(target) : nextId}".`,
    color: chalk.green,
    symbol: "success",
    type: "outro",
  });
}
