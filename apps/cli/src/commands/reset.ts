import chalk from "chalk"
import { confirm, isCancel, outro } from "@clack/prompts"

import { resetStoredConfig } from "../utils/config"
import { renderIntro } from "../utils/lib"

export async function runReset(skipConfirm: boolean = false) {
  renderIntro({
    badge: "PushAI Reset",
    title: "Clear saved configuration",
  })

  try {
    let shouldDelete = false

    if (skipConfirm) {
      shouldDelete = true
    } else {
      const shouldDeleteResult = await confirm({
        message: chalk.red("Remove all saved providers, models, and API keys?"),
        initialValue: false,
      })

      if (isCancel(shouldDeleteResult)) {
        outro(chalk.dim("Reset cancelled. No changes were made."))
        return
      }

      shouldDelete = shouldDeleteResult
    }

    if (!shouldDelete) {
      outro(chalk.dim("Configuration reset skipped."))
      return
    }

    const deleted = await resetStoredConfig()

    if (deleted) {
      outro(chalk.green("PushAI configuration and credentials cleared."))
    } else {
      outro(chalk.dim("No saved configuration was found."))
    }
  } catch (error: any) {
    if (error.name === "ExitPromptError" || error.name === "AbortError") {
      outro(chalk.red("Operation cancelled."))
      return
    }

    throw error
  }
}
