import readline from "node:readline";
import chalk from "chalk";
import { showHeader } from "./header";
import { spinner } from "./spinner";

function isPromptCancellation(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "ExitPromptError" || error.message.includes("force closed"))
  );
}

function printCancelled(fallback?: string) {
  if (spinner.isSpinning) {
    spinner.stopAndPersist();
  }

  process.stdout.write("\u001B[?25h");

  showHeader({
    title: fallback || "operation cancelled.",
    color: chalk.red,
    symbol: "error",
    type: "outro",
  });
}

let keypressPatched = false;

export function cancellation<T extends unknown[]>(
  operation: (...args: T) => Promise<unknown>,
  fallback?: string,
) {
  return async (...args: T): Promise<void> => {
    let handled = false;

    const cancel = () => {
      if (handled) return;
      handled = true;

      printCancelled(fallback);
      process.exit(130); // 128 + SIGINT(2)
    };

    // cooked stdin: the terminal generates a real SIGINT
    process.once("SIGINT", cancel);

    // raw stdin (left over from an @inquirer/prompts prompt): the terminal
    // no longer turns Ctrl+C into SIGINT, so catch the keypress itself
    let onKeypress: ((str: string, key: readline.Key) => void) | undefined;

    if (process.stdin.isTTY) {
      if (!keypressPatched) {
        readline.emitKeypressEvents(process.stdin);
        keypressPatched = true;
      }

      onKeypress = (_str, key) => {
        if (key?.ctrl && key.name === "c") {
          cancel();
        }
      };

      process.stdin.on("keypress", onKeypress);
    }

    try {
      await operation(...args);
    } catch (error: unknown) {
      if (!isPromptCancellation(error)) {
        throw error;
      }

      handled = true;
      printCancelled(fallback);
      process.exit(0);
    } finally {
      process.removeListener("SIGINT", cancel);

      if (onKeypress) {
        process.stdin.removeListener("keypress", onKeypress);
      }
    }
  };
}
