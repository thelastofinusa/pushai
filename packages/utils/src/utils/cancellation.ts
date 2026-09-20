import chalk from "chalk";
import ora from "ora";

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

      console.log();

      const spinner = ora();
      spinner.fail(chalk.red(fallback || "Operation cancelled."));

      process.exit(0);
    }
  };
}
