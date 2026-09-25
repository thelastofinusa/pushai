import { confirm } from "@inquirer/prompts";
import { showHeader } from "@pushai/utils";
import chalk from "chalk";
import { spinner } from "../lib/spinner";

export async function reRunSetup(): Promise<boolean> {
  spinner.warn("No PushAI configuration found.");

  const proceed = await confirm({
    message: "Would you like to start the setup wizard?",
    default: false,
  });

  if (!proceed) {
    showHeader({
      title: "Setup wizard skipped.",
      symbol: "info",
      color: chalk.blue,
      type: "outro",
    });
    return false;
  }

  const { runSetup } = await import("./run/setup");
  await runSetup();

  return true;
}
