import chalk from "chalk"

/**
 * Clean error handler to avoid repeating logic
 */
export function handleError(error: any) {
  if (error.name === "ExitPromptError") {
    return // Do nothing, let the main block handle it
  }

  const isAuthError =
    error.message?.includes("API key not valid") ||
    error.message?.includes("Authorization header") ||
    [400, 401, 403].includes(error.status)

  if (isAuthError) {
    console.log(chalk.red("\nIt looks like your API key/Token is invalid."))
    console.log(chalk.yellow("👉 Run `pai reset` to update your credentials."))
  } else {
    console.log(chalk.red(`\n${error.message || "An unknown error occurred."}`))
  }
}
