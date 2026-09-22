import { confirm } from "@inquirer/prompts";
import { getStoredConfig, resetStoredConfig } from "@pushai/core";
import { cancellation } from "@pushai/utils";
import chalk from "chalk";
import type { Command } from "commander";
import ora from "ora";

async function action(title: string) {
  console.log();
  console.log(chalk.bold(title));
  console.log();

  const spinner = ora();

  spinner.start("Checking saved configuration...");
  const config = await getStoredConfig();

  if (!config) {
    spinner.warn("No configuration found.");
    console.log();
    return;
  }

  spinner.succeed("Current configuration found.");

  console.log(chalk.gray(`  • Mode:  ${config.mode}`));
  console.log(chalk.gray(`  • Model: ${config.model}`));

  if (config.mode === "byok") {
    console.log(chalk.gray(`  • Key:   configured (hidden)`));
  }

  console.log();

  const proceed = await confirm({
    message: "Are you sure you want to delete this configuration?",
    default: false,
  });

  if (!proceed) {
    console.log(chalk.dim("Reset cancelled."));
    console.log();
    return;
  }

  spinner.start("Deleting saved configuration...");

  const deleted = await resetStoredConfig();

  if (!deleted) {
    spinner.warn("No configuration was deleted.");
    return;
  }

  spinner.succeed("PushAI configuration deleted.");
  console.log();
}

export const resetCommand = {
  register(program: Command) {
    program
      .command("reset")
      .description("Delete local configuration")
      .action(cancellation(() => action("Reset PushAI Configuration")));
  },
};
