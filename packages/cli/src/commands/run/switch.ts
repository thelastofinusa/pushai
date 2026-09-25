import { select } from "@inquirer/prompts";
import { showHeader } from "@pushai/utils";
import chalk from "chalk";
import { getConfig } from "../../config/store.config";
import { formatProvider } from "../../lib/format";
import { configStore } from "../../lib/store";

export async function runSwitch(targetId?: string) {
  showHeader({
    title: "Switch Active Provider",
    color: chalk.blue,
    symbol: "chevron",
    type: "intro",
  });

  const config = await getConfig();

  if (!config) return;

  const active = config.providers.find((p) => p.id === config.activeId);

  console.log(
    ` ${chalk.dim("Active".padEnd(12))} ${
      active ? chalk.cyan(formatProvider(active)) : chalk.dim("none")
    }`,
  );

  console.log();

  /* ------------------------------------------------------------------ */
  /* Non-interactive: `pai switch <id>`                                  */
  /* ------------------------------------------------------------------ */

  if (targetId) {
    const target = config.providers.find((p) => p.id === targetId);

    if (!target) {
      const available = config.providers.map((p) => p.id).join(", ");

      showHeader({
        title: `Unknown provider "${targetId}". Available: ${available}`,
        color: chalk.red,
        symbol: "error",
        type: "outro",
      });

      return;
    }

    if (target.id === config.activeId) {
      showHeader({
        title: `"${formatProvider(target)}" is already active.`,
        color: chalk.dim,
        symbol: "info",
        type: "outro",
      });

      return;
    }

    await configStore.setActiveProvider(target.id);

    showHeader({
      title: `Switched to "${formatProvider(target)}".`,
      color: chalk.green,
      symbol: "success",
      type: "outro",
    });

    return;
  }

  /* ------------------------------------------------------------------ */
  /* Interactive picker                                                  */
  /* ------------------------------------------------------------------ */

  if (config.providers.length === 1) {
    showHeader({
      title: "Only one provider is configured. Add another with `pai setup`.",
      color: chalk.dim,
      symbol: "info",
      type: "outro",
    });

    return;
  }

  const nextId = await select({
    message: "Which provider should become active?",
    choices: config.providers.map((p) => {
      const isActive = p.id === config.activeId;

      return {
        name: isActive
          ? `${formatProvider(p)} ${chalk.green("• active")}`
          : formatProvider(p),
        value: p.id,
        description: isActive
          ? chalk.dim("Currently selected")
          : chalk.cyan(`Switch to ${p.mode === "byok" ? p.provider : p.mode}`),
      };
    }),
  });

  const switched = await configStore.setActiveProvider(nextId);

  if (!switched) {
    showHeader({
      title: "Failed to switch provider.",
      color: chalk.red,
      symbol: "error",
      type: "outro",
    });

    return;
  }

  const target = config.providers.find((p) => p.id === nextId);

  showHeader({
    title: `Switched to "${target ? formatProvider(target) : nextId}".`,
    color: chalk.green,
    symbol: "success",
    type: "outro",
  });
}
