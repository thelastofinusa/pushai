import type { SetupMode } from "@pushai/types";
import { cancellation } from "@pushai/utils";
import chalk from "chalk";
import type { Command } from "commander";
import inquirer from "inquirer";

async function action(title: string) {
  console.log(chalk.bold(title));

  const { mode } = await inquirer.prompt<{ mode: SetupMode }>([
    {
      type: "select",
      name: "mode",
      message: "How should we power your commit messages?",
      choices: [
        {
          name: "PushAI Cloud",
          value: "cloud",
          description: "Managed AI service with no API key required",
          disabled: "Cloud support coming soon",
        },
        {
          name: "Custom API Key",
          value: "byok",
          description: "Use your own API key from a supported provider",
          disabled: "Custom providers coming soon",
        },
        {
          name: "Local AI",
          value: "local",
          description: "Run models locally with Ollama, including offline",
        },
      ],
    },
  ]);

  console.log({ mode });
}

export const setupCommand = {
  register(program: Command) {
    program
      .command("setup")
      .description("Run setup wizard")
      .action(cancellation(async () => action("\nPushAI Setup\n")));
  },
};
