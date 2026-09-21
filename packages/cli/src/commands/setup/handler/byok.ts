import { confirm, password, search, select } from "@inquirer/prompts";
import type { AIModel } from "@pushai/types";
import chalk from "chalk";
import type { Ora } from "ora";
import { providers } from "../../../providers";

export async function handleByokMode(
  spinner: Ora,
): Promise<{ provider: string; apiKey: string; model: string } | undefined> {
  const providerId = await select({
    message: "Which AI provider would you like to use?",
    choices: providers.map((provider) => ({
      name: provider.name,
      value: provider.id,
    })),
  });

  const provider = providers.find((provider) => provider.id === providerId);

  if (!provider) {
    throw new Error("Invalid provider");
  }

  let apiKey: string;
  let models: AIModel[];

  while (true) {
    apiKey = await password({
      message: `${provider.name} API key:`,
      mask: "*",
    });

    spinner.start(`Validating ${chalk.green(provider.name)} API key..`);

    try {
      models = await provider.getModels(apiKey);

      spinner.succeed(
        `Successfully validated ${chalk.green(provider.name)} API key`,
      );
      break;
    } catch (error) {
      spinner.fail(`Could not authenticate with ${chalk.red(provider.name)}`);

      if (error instanceof Error) {
        console.log(chalk.yellow(error.message));
        console.log();
      }

      const retry = await confirm({
        message: "Would you like to try another API key?",
        default: true,
      });

      if (!retry) {
        console.log(
          chalk.dim("BYOK setup cancelled. No API key was configured."),
        );
        console.log();

        return;
      }
    }
  }

  if (models.length === 0) {
    throw new Error(`No models available for ${provider.name}`);
  }

  const modelName = models[0].name;
  let modelId = models[0].id;

  if (models.length > 1) {
    const answer = await search({
      message: "Search and select a model",
      source: async (input = "") => {
        const query = input.toLowerCase();

        return models
          .filter((model) => model.name.toLowerCase().includes(query))
          .map((model) => ({
            name: model.name,
            value: model.id,
          }));
      },
    });
    spinner.succeed(`${chalk.green(answer)} selected and ready.`);
    modelId = answer;
  } else {
    spinner.succeed(`Using ${modelName}'s ${chalk.green(modelId)} model`);
  }

  return {
    provider: provider.id,
    apiKey,
    model: modelId,
  };
}
