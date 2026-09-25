import { confirm, password, search, select } from "@inquirer/prompts";
import { providers } from "@pushai/core";
import type { AIModel } from "@pushai/types";
import { showHeader } from "@pushai/utils";
import chalk from "chalk";
import { spinner } from "../lib/spinner";

export async function handleByokMode(): Promise<
  { provider: string; apiKey: string; model: string } | undefined
> {
  const providerId = await select({
    message: "which provider would you like to use?",
    choices: providers.map((provider) => ({
      name: provider.name,
      value: provider.id,
    })),
  });

  const provider = providers.find((provider) => provider.id === providerId);

  if (!provider) {
    throw new Error("invalid provider");
  }

  let apiKey: string;
  let models: AIModel[];

  while (true) {
    apiKey = await password({
      message: `your ${provider.name} key:`,
      mask: "•",
    });

    spinner.start(`validating ${chalk.green(provider.name)} api key..`);

    try {
      models = await provider.getModels(apiKey);

      spinner.succeed("validated successfully");
      break;
    } catch (error) {
      if (error instanceof Error) {
        spinner.fail(chalk.red(error.message));
        console.log();
      }

      const retry = await confirm({
        message: "would you like to try another api key?",
        default: true,
      });

      if (!retry) {
        showHeader({
          title: "setup cancelled.",
          color: chalk.dim,
          symbol: "info",
          type: "outro",
        });

        return;
      }
    }
  }

  if (models.length === 0) {
    throw new Error(`no models available for ${provider.name}`);
  }

  const modelName = models[0].name;
  let modelId = models[0].id;

  if (models.length > 1) {
    const answer = await search({
      message: "search and select a model",
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
    spinner.succeed(`using ${modelName}'s ${chalk.green(modelId)} model`);
  }

  return {
    provider: provider.id,
    apiKey,
    model: modelId,
  };
}
