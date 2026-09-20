import chalk from "chalk";
import inquirer from "inquirer";

// Safe prompt wrapper to catch Ctrl+C / ExitPromptError gracefully
export async function prompt<T>(questions: any): Promise<T> {
  try {
    return (await inquirer.prompt(questions)) as T;
  } catch (error: any) {
    if (
      error.name === "ExitPromptError" ||
      error.message?.includes("force closed")
    ) {
      console.log(chalk.yellow("\nOperation cancelled."));
      process.exit(0);
    }
    throw error;
  }
}
