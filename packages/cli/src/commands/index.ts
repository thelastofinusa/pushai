import { cancellation } from "@pushai/utils";
import type { Command } from "commander";
import { pkgConfig } from "../config/config.config";

import { runCommit } from "./run/commit";
import { runPeak } from "./run/peak";
import { runReset } from "./run/reset";
import { runSetup } from "./run/setup";
import { runSwitch } from "./run/switch";
import { runUpdate } from "./run/update";

export const commands = {
  commit: {
    register(program: Command) {
      program
        .command("commit")
        .description("Create an AI-generated Git commit")
        .option("-p, --push", "Automatically push the commit")
        .option("--dry-run", "Preview without creating a commit")
        .option("-m, --message <message>", "Use a custom commit message")
        .action(
          cancellation((options) =>
            runCommit({
              autoPush: options.push,
              dryRun: options.dryRun,
              customMessage: options.message,
            }),
          ),
        );
    },
  },
  peak: {
    register(program: Command) {
      program
        .command("peak")
        .description("Peek at current PushAI configuration")
        .option("-k, --key", "Show the configured API key")
        .action(
          cancellation((options: { key?: boolean }) =>
            runPeak(options.key ?? false, `${pkgConfig.name} peak --key`),
          ),
        );
    },
  },
  reset: {
    register(program: Command) {
      program
        .command("reset")
        .description("Delete local configuration")
        .action(cancellation(runReset));
    },
  },
  switch: {
    register(program: Command) {
      program
        .command("switch")
        .description("Switch the active AI provider")
        .argument("[provider]", "Provider id (e.g. openai, gemini, local)")
        .action(cancellation((provider?: string) => runSwitch(provider)));
    },
  },
  setup: {
    register(program: Command) {
      program
        .command("setup")
        .description("Run PushAI setup wizard")
        .action(cancellation(runSetup));
    },
  },
  update: {
    register(program: Command) {
      program
        .command("update")
        .description("Check for a newer version of PushAI")
        .action(cancellation(runUpdate));
    },
  },
};
