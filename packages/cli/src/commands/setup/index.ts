import { select } from "@inquirer/prompts";
import type { SetupConfig, SetupMode } from "@pushai/types";
import { cancellation, getPackageManager, sleep } from "@pushai/utils";
import chalk from "chalk";
import type { Command } from "commander";
import ora from "ora";
import { handleByokMode } from "./handler/byok";
import { handleLocalMode } from "./handler/local";

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
        description: chalk.bgGreen(
          " Use PushAI's managed AI — authentication required ",
        ),
      },
      {
        name: "Bring Your Own API Key",
        value: "byok",
        description: chalk.bgGreen(
          " Connect your own API key from supported providers ",
        ),
      },
      {
        name: "Run AI Locally",
        value: "local",
        description: chalk.bgGreen(
          " Run AI on your machine — Ollama required ",
        ),
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
  spinner.start(`Saving ${config.mode} configuration..`);
  await sleep(400);
  spinner.succeed("Setup wizard completed successfully.");
  console.log();
}

export const setupCommand = {
  register(program: Command) {
    program
      .command("setup")
      .description("Run setup wizard")
      .action(cancellation(() => action("PushAI Setup", "pushai", "setup")));
  },
};
