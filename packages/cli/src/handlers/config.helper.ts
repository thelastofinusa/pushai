import { confirm } from "@inquirer/prompts";
import type { SetupConfig } from "@pushai/types";
import { setSpinnerColor, showHeader, spinner } from "@pushai/utils";
import chalk from "chalk";
import type { Color } from "ora";
import { setupAction } from "../actions/setup.action";
import { configStore } from "../config/store.config";

export async function handleEnsureConfig(
  spinnerColor: Color = "cyan",
): Promise<boolean | SetupConfig> {
  setSpinnerColor(spinnerColor);
  spinner.start("checking configuration..");

  const existingConfig = await configStore.getStoredConfig();

  if (!existingConfig) {
    spinner.info("no configuration found");
    console.log();

    const proceed = await confirm({
      message: "would you like to start the setup wizard?",
      default: true,
    });

    if (!proceed) {
      showHeader({
        title: "setup wizard skipped.",
        symbol: "info",
        color: chalk.dim,
        type: "outro",
      });
      return false;
    }

    await setupAction();
    return true;
  }

  spinner.stop();
  return existingConfig;
}
