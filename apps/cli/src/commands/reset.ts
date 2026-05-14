import chalk from "chalk"
import { confirm } from "@inquirer/prompts"
import { resetStoredConfig } from "../utils/config"

export async function runReset() {
  try {
    const shouldDelete = await confirm({
      message: chalk.red("Delete all PushAI configurations and API keys?"),
      default: false,
    })

    if (shouldDelete) {
      const deleted = resetStoredConfig()
      if (deleted) {
        console.log(
          chalk.green("\n✔ Successfully removed the PushAI directory.\n")
        )
      } else {
        console.log(
          chalk.dim("\nNo configuration directory found. Nothing to delete.\n")
        )
      }
    } else {
      console.log(chalk.dim("\nOperation cancelled.\n"))
    }
  } catch (error: any) {
    if (error.name === "ExitPromptError") {
      console.log(chalk.dim("\nOperation cancelled.\n"))
      return
    }
    throw error
  }
}
