import chalk from "chalk"
import { confirm, intro, isCancel, outro } from "@clack/prompts"
import { resetStoredConfig } from "../utils/config"
import { msg } from "../constants/msg"

export async function runReset() {
  intro(chalk.yellow.bold(msg.reset.intro))
  try {
    const shouldDeleteResult = await confirm({
      message: chalk.red(msg.reset.confirm),
      initialValue: false,
    })

    if (isCancel(shouldDeleteResult)) {
      outro(chalk.red(msg.common.operationCancelled))
      return
    }

    if (!shouldDeleteResult) {
      outro(chalk.red(msg.common.operationCancelled))
      return
    }

    const deleted = await resetStoredConfig()
    if (deleted) {
      outro(chalk.green.bold(msg.reset.outro))
    } else {
      outro(chalk.dim(msg.reset.nothingToDelete))
    }
  } catch (error: any) {
    if (error.name === "ExitPromptError" || error.name === "AbortError") {
      outro(chalk.red(msg.common.operationCancelled))
      return
    }
    throw error
  }
}
