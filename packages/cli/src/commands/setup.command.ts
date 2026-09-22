import { select } from "@inquirer/prompts";
import { setStoredConfig } from "@pushai/core";
import type { SetupConfig, SetupMode } from "@pushai/types";
import { cancellation, getPackageManager } from "@pushai/utils";
import chalk from "chalk";
import type { Command } from "commander";
import ora from "ora";
import { handleByokMode } from "../handlers/byok.handler";
import { handleLocalMode } from "../handlers/local.handler";

async function action(title: string, name: string, command: string) {
  console.log();
  console.log(chalk.bold(title));
  console.log();

  const spinner = ora();
  const pm = getPackageManager();

  const mode = await select<SetupMode>({
    message: "How would you like to generate commits?",
    choices: [
      {
        name: "PushAI Managed AI",
        value: "cloud",
        description: "Use PushAI's managed AI — authentication required",
        disabled: "(coming soon)",
      },
      {
        name: "Bring Your Own API Key",
        value: "byok",
        description: "Connect your own API key from supported providers",
      },
      {
        name: "Run AI Locally",
        value: "local",
        description: "Run AI on your machine — Ollama required",
      },
    ],
  });

  let config: SetupConfig;

  if (mode === "local") {
    const local = await handleLocalMode(spinner, pm, name, command);

    if (!local) return;

    config = {
      mode: "local",
      model: local,
    };
  } else if (mode === "byok") {
    const byok = await handleByokMode(spinner);

    if (!byok) return;

    config = {
      mode: "byok",
      provider: byok.provider,
      apiKey: byok.apiKey,
      model: byok.model,
    };
  } else {
    spinner.fail("Feature coming soon");
    return;
  }

  console.log();
  spinner.start(`Setting up ${chalk.gray(config.mode)} configuration..`);

  try {
    await setStoredConfig(config);
    spinner.succeed("Setup wizard completed successfully.");
  } catch (error) {
    spinner.fail("Failed to save configuration.");
    console.error(
      chalk.red(error instanceof Error ? error.message : "Unknown error"),
    );
    process.exit(1);
  }
}

export const setupCommand = {
  register(program: Command) {
    program
      .command("setup")
      .description("Run PushAI setup wizard")
      .action(
        cancellation(() =>
          action("Run PushAI setup wizard", "pushai", "setup"),
        ),
      );
  },
};
