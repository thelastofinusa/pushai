import type { SetupMode } from "@pushai/types";
import chalk from "chalk";
import type { Command } from "commander";
import { prompt } from "../utils/prompt";

async function action() {
  console.log(chalk.bold("\nPushAI Setup\n"));

  const { mode } = await prompt<{ mode: SetupMode }>([
    {
      type: "select",
      name: "mode",
      message: "Select execution mode:",
      choices: [
        { name: "Managed Cloud", value: "cloud" },
        { name: "BYOK (Bring Your Own Key)", value: "byok" },
        { name: "Local AI (Ollama)", value: "local" },
      ],
    },
  ]);

  console.log(mode);
}

export const setupCommand = {
  register(program: Command) {
    program.command("setup").description("Run setup wizard").action(action);
  },
};
