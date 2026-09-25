import { cancellation } from "@pushai/utils";
import type { Command } from "commander";
import { peakAction } from "./peak.action";
import { resetAction } from "./reset.action";
import { setupAction } from "./setup.action";
import { switchAction } from "./switch.action";

export const actions = {
  commit: {
    register(program: Command) {
      program
        .command("commit")
        .description("create an ai-generated git commit")
        .option("-p, --push", "automatically push the commit")
        .option("--dry-run", "preview without creating a commit")
        .option("-m, --message <message>", "use a custom commit message");
    },
  },
  peak: {
    register(program: Command) {
      program
        .command("peak")
        .description("peek at current pushai configuration")
        .option("-k, --key", "show the configured API key")
        .action(
          cancellation((options: { key?: boolean }) =>
            peakAction("peak", options.key ?? false, "--key"),
          ),
        );
    },
  },
  reset: {
    register(program: Command) {
      program
        .command("reset")
        .description("delete local configuration")
        .action(cancellation(() => resetAction("reset")));
    },
  },
  switch: {
    register(program: Command) {
      program
        .command("switch")
        .description("switch the active ai provider")
        .action(cancellation(() => switchAction("switch")));
    },
  },
  setup: {
    register(program: Command) {
      program
        .command("setup")
        .description("run pushai setup wizard")
        .action(cancellation(() => setupAction("setup")));
    },
  },
  update: {
    register(program: Command) {
      program
        .command("update")
        .description("check for a newer version of pushai");
    },
  },
};
