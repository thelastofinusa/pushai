import { getStoredConfig } from "@pushai/core";
import { cancellation, getPackageManager } from "@pushai/utils";
import chalk from "chalk";
import type { Command } from "commander";
import { showConfiguration } from "../lib/messages";

async function action(title: string, name: string, command: string) {
  console.log();
  console.log(chalk.bold(title));
  console.log();

  const pm = getPackageManager();
  const config = await getStoredConfig();

  if (!config) {
    console.log(chalk.yellow("No PushAI configuration found."));
    console.log();
    console.log(
      chalk.dim(`Run "${pm.runner} ${name} ${command}" to configure PushAI.`),
    );
    console.log();

    return;
  }

  showConfiguration(config);
}

export const peakCommand = {
  register(program: Command) {
    program
      .command("peak")
      .description("Peek at current PushAI configuration")
      .action(
        cancellation(() => action("PushAI Configuration", "pushai", "peak")),
      );
  },
};
