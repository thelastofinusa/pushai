import { select } from "@inquirer/prompts";
import { ollamaProvider } from "@pushai/core";
import type { getPackageManager } from "@pushai/utils";
import chalk from "chalk";
import type ora from "ora";
import { showNoModels, showOllamaNotInstalled } from "../lib/messages";

export async function handleLocalMode(
  spinner: ReturnType<typeof ora>,
  pm: ReturnType<typeof getPackageManager>,
  name: string,
  command: string,
): Promise<string> {
  spinner.start("Verifying Ollama installation..");

  const ollama = await ollamaProvider();

  if (!ollama.installed) {
    spinner.fail(chalk.red("Ollama is not installed."));
    showOllamaNotInstalled(`${pm.runner} ${name} ${command}`);
    process.exit(1);
  }

  spinner.succeed(`Ollama ${chalk.bold(`v${ollama.version}`)} detected`);

  spinner.start("Finding local models..");

  if (!ollama.models.length) {
    spinner.warn(chalk.yellow("No local models found"));
    showNoModels(`${pm.runner} ${name} ${command}`);
    process.exit(1);
  }

  if (ollama.models.length > 1) {
    spinner.succeed(
      `You have ${chalk.yellow(ollama.models.length)} models installed`,
    );
  } else {
    spinner.succeed(
      `${chalk.bold(ollama.models[0])} is the only model installed`,
    );
  }

  let model = ollama.models[0];

  if (ollama.models.length > 1) {
    model = await select({
      message: "Which model would you like to use?",
      choices: ollama.models.map((model) => ({
        name: model,
        value: model,
      })),
    });

    spinner.succeed(`${chalk.green(model)} selected and ready.`);
  } else {
    spinner.succeed(`Using Ollama's ${chalk.green(model)} model`);
  }

  return model;
}
