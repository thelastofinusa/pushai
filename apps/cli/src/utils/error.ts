import chalk from "chalk"
import { msg } from "./msg.js"

export function handleError(err: any): void {
  if (err.name === "ExitPromptError") return

  const isAuthError =
    err.message?.includes("API key not valid") ||
    err.message?.includes("Authorization header") ||
    [400, 401, 403].includes(err.status)

  if (isAuthError) {
    console.log(chalk.red(msg.errors.authInvalid))
    console.log(chalk.yellow(msg.errors.authFix))
  } else {
    console.log(chalk.red(msg.errors.unknown(err.message)))
  }
}
