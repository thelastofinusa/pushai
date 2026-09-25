import chalk from "chalk";
import { showHeader } from "./header";

function isPromptCancellation(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "ExitPromptError" || error.message.includes("force closed"))
  );
}

export function cancellation<T extends unknown[]>(
  operation: (...args: T) => Promise<unknown>,
  fallback?: string,
) {
  return async (...args: T): Promise<void> => {
    try {
      await operation(...args);
    } catch (error: unknown) {
      if (!isPromptCancellation(error)) {
        throw error;
      }

      showHeader({
        title: fallback || "Operation cancelled.",
        color: chalk.red,
        symbol: "error",
        type: "outro",
      });

      process.exit(0);
    }
  };
}
