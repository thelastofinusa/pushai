import chalk from "chalk"
import { msg } from "./msg"

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
    console.log(chalk.red(msg.errors.authInvalid))
    console.log(chalk.yellow(msg.errors.authFix))
  } else {
    console.log(chalk.red(msg.errors.unknown(error.message)))
  }
}
