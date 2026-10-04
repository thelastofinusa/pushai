import { cancellation } from "@pushai/utils";
import type { Command } from "commander";
import { commitAction } from "./commit.action";
import { peakAction } from "./peak.action";
import { pushAction } from "./push.action";
import { resetAction } from "./reset.action";
import { setupAction } from "./setup.action";
import { switchAction } from "./switch.action";
import { updateAction } from "./update.action";

export const actions = {
  commit: {
    register(program: Command) {
      program
        .command("commit")
        .description("create an ai-generated git commit")
        .option("--dry-run", "preview without creating a commit")
        .option("-p, --push", "automatically push the commit")
        .option("-m, --message <message>", "use a custom commit message")
        .action(
          cancellation((options, command: Command) =>
            commitAction(
              {
                autoPush: options.push,
                dryRun: options.dryRun,
                customMessage: options.message,
              },
              command,
            ),
          ),
        );
    },
  },
  push: {
    register(program: Command) {
      program
        .command("push")
        .description("push local commits to the remote")
        .action(cancellation((command: Command) => pushAction(command)));
    },
  },
  peak: {
    register(program: Command) {
      program
        .command("peak")
        .description("peek at current pushai configuration")
        .option("-k, --key", "show the configured API key")
        .action(
          cancellation((options: { key?: boolean }, command: Command) =>
            peakAction({ withApiKey: options.key ?? false }, command),
          ),
        );
    },
  },
  reset: {
    register(program: Command) {
      program
        .command("reset")
        .description("delete local configuration")
        .option("-a, --all", "delete all configuration, including the API key")
        .action(
          cancellation((options: { all?: boolean }, command: Command) =>
            resetAction({ all: options.all ?? false }, command),
          ),
        );
    },
  },
  switch: {
    register(program: Command) {
      program
        .command("switch")
        .description("switch the active ai provider")
        .action(cancellation((command: Command) => switchAction(command)));
    },
  },
  setup: {
    register(program: Command) {
      program
        .command("setup")
        .description("run pushai setup wizard")
        .action(cancellation((command: Command) => setupAction(command)));
    },
  },
  update: {
    register(program: Command) {
      program
        .command("update")
        .description("check for a newer version of pushai")
        .action(cancellation((command: Command) => updateAction(command)));
    },
  },
};
