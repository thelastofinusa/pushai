import { select } from "@inquirer/prompts";
import { ollamaProvider } from "@pushai/core";
import { type getPackageManager, sleep } from "@pushai/utils";
import chalk from "chalk";
import { pkgConfig } from "../config/config.config";
import { showNoModels, showOllamaNotInstalled } from "../lib/messages";
import { spinner } from "../lib/spinner";

export async function handleLocalMode(
  pm: ReturnType<typeof getPackageManager>,
  command: string,
): Promise<string> {
  spinner.start("Verifying Ollama installation..");

  const ollama = await ollamaProvider();
  await sleep();

  if (!ollama.installed) {
    spinner.fail(chalk.red("Ollama is not installed."));
    showOllamaNotInstalled(`${pm.runner} ${pkgConfig.name} ${command}`);
    process.exit(1);
  }

  spinner.succeed(`Ollama ${chalk.bold(`v${ollama.version}`)} detected`);

  spinner.start("Finding local models..");
  await sleep(200);

  if (!ollama.models.length) {
    spinner.warn(chalk.yellow("No local models found"));
    showNoModels(`${pm.runner} ${pkgConfig.name} ${command}`);
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
