import ora, { Ora } from "ora"
import chalk from "chalk"
import simpleGit from "simple-git"
import { confirm, select, text, isCancel, note, outro } from "@clack/prompts"

import { runConfig } from "./config"
import { getAIProvider } from "../providers"
import { handleError } from "../utils/error"
import { hasRemote, initRepo, prepareGitStage } from "../utils/git"
import { getStoredConfig } from "../utils/config"
import { Config } from "../types"
import { msg } from "../constants/msg"
import { createSlowSpinner } from "../utils/lib"

const git = simpleGit()

/**
 * Ensures the commit message is not empty.
 */
async function ensureNonEmptyMessage(
  message: string,
  provider: any,
  diff: string,
  abortSignal: AbortSignal,
  spinner: Ora
): Promise<string> {
  let current = message

  while (!current || current.trim() === "") {
    spinner.fail(chalk.red(msg.commit.emptyMessageTitle))

    const action = await select({
      message: msg.commit.emptyMessagePrompt,
      options: [
        { label: msg.commit.emptyRegenerate, value: "regenerate" },
        { label: msg.commit.emptyManual, value: "manual" },
        { label: msg.commit.emptyCancel, value: "cancel" },
      ],
    })

    if (isCancel(action) || action === "cancel") {
      outro(chalk.dim(msg.commit.processStopped))
      process.exit(0)
    }

    if (action === "regenerate") {
      spinner.start(chalk.blue(msg.commit.regenerating))

      const stopSlow = createSlowSpinner(
        spinner,
        msg.commit.generatingSlow10,
        msg.commit.generatingSlow60
      )

      try {
        current = await provider.generateCommitMessage(diff, abortSignal, {
          regenerate: true,
        })

        stopSlow()

        if (!current || current.trim() === "") {
          spinner.warn(chalk.yellow(msg.commit.stillEmptyWarning))
          continue
        }

        spinner.succeed(chalk.green(msg.commit.regenerated))
      } catch (err: any) {
        stopSlow()

        spinner.fail(chalk.red(msg.commit.regenerationFailed(err.message)))

        if (err.name === "AbortError") {
          outro(chalk.yellow(msg.commit.generationCancelled))
          process.exit(0)
        }
      }
    } else if (action === "manual") {
      const manualMsg = await text({
        message: msg.commit.manualMessagePrompt,
        validate: (value) =>
          !value || value.trim() === ""
            ? msg.commit.manualMessageRequired
            : undefined,
      })

      if (isCancel(manualMsg)) {
        outro(chalk.dim(msg.commit.processStopped))
        process.exit(0)
      }

      current = manualMsg as string

      spinner.succeed(chalk.green(msg.commit.manualAccepted))
    }
  }

  return current
}

export async function runCommit(
  dryRun?: boolean,
  autoPush?: boolean,
  userMessage?: string,
  onControllerCreate?: (controller: AbortController) => void
) {
  const abortController = new AbortController()

  process.stdin.setRawMode?.(true)
  process.stdin.resume()
  process.stdin.setEncoding("utf8")

  const handleCancel = () => {
    abortController.abort()
    outro(chalk.red(msg.common.operationCancelled))
    process.exit(0)
  }

  const handleKeyPress = (key: string) => {
    if (key === "\u0003") handleCancel()
  }

  process.stdin.on("data", handleKeyPress)
  onControllerCreate?.(abortController)

  const handleSigint = () => {
    abortController.abort()
    outro(chalk.red(msg.common.operationCancelled))
    process.exit(0)
  }
  process.once("SIGINT", handleSigint)

  try {
    const config = await getStoredConfig()
    if (!config.apiKey || !config.provider || !config.model) {
      await runConfig()
      Object.assign(config, await getStoredConfig())
      return
    }

    console.log(msg.commit.intro(config.provider.toUpperCase(), config.model))

    let stageResult = await prepareGitStage()
    if (!stageResult.isRepo) {
      console.log(chalk.yellow(msg.commit.gitRepoMissing))
      const shouldInit = await confirm({
        message: msg.commit.initConfirm,
        initialValue: true,
      })
      if (isCancel(shouldInit)) {
        outro(chalk.red(msg.common.operationCancelled))
        process.exit(0)
      }
      if (shouldInit) {
        await initRepo()
        console.log(chalk.green(msg.commit.initSuccess))
        stageResult = await prepareGitStage()
      } else {
        outro(chalk.dim(msg.commit.abortNoRepo))
        process.exit(0)
      }
    }

    const diff = stageResult.diff
    if (!diff) {
      outro(chalk.red(msg.commit.noChanges))
      process.exit(0)
    }

    const spinner = ora({ color: "cyan" })
    let message = ""
    let provider

    // =========================================================
    // USER-PROVIDED MESSAGE (skip AI)
    // =========================================================
    if (userMessage) {
      message = userMessage.trim()
      if (!message) {
        spinner.fail(chalk.red("Empty user message provided."))
        outro(chalk.red("Please provide a non-empty commit message."))
        process.exit(1)
      }
      spinner.start(chalk.blue(msg.commit.usingUserMessage))
      await new Promise((resolve) => setTimeout(resolve, 300))
      spinner.succeed(chalk.green(msg.commit.userMessageAccepted))
    } else {
      // =========================================================
      // AI GENERATION (existing code)
      // =========================================================
      try {
        spinner.start(chalk.blue(msg.commit.generating))
        const stopSlow = createSlowSpinner(
          spinner,
          msg.commit.generatingSlow10,
          msg.commit.generatingSlow60
        )
        provider = await getAIProvider(config as Config)
        message = await provider.generateCommitMessage(
          diff,
          abortController.signal
        )
        stopSlow()
        message = await ensureNonEmptyMessage(
          message,
          provider,
          diff,
          abortController.signal,
          spinner
        )
        spinner.succeed(chalk.green(msg.commit.generated))
      } catch (error: any) {
        spinner.fail(chalk.red.bold(msg.commit.generationFailed))
        if (error.name === "AbortError") {
          outro(chalk.yellow(msg.commit.generationCancelled))
          process.exit(0)
        }
        handleError(error)
        process.exit(1)
      }
    }

    // =========================================================
    // DRY RUN
    // =========================================================
    if (dryRun) {
      note(chalk.magenta(message), msg.commit.noteTitle)
      outro(chalk.yellow(msg.common.dryRun))
      process.exit(0)
    }

    // =========================================================
    // CONFIRMATION LOOP
    // =========================================================
    let confirmed = false
    if (autoPush) {
      confirmed = true
    } else {
      while (!confirmed) {
        note(chalk.magenta(message), msg.commit.noteTitle)
        const actionResult = await select({
          message: msg.commit.actionPrompt,
          options: [
            { label: msg.commit.actions.accept, value: "accept" },
            { label: msg.commit.actions.edit, value: "edit" },
            { label: msg.commit.actions.regenerate, value: "regenerate" },
            { label: msg.commit.actions.cancel, value: "cancel" },
          ],
        })
        if (isCancel(actionResult)) {
          outro(chalk.dim(msg.commit.processStopped))
          process.exit(0)
        }
        const action = actionResult as string
        if (action === "accept") {
          confirmed = true
        } else if (action === "edit") {
          const editedResult = await text({
            message: msg.commit.editPrompt,
            initialValue: message,
          })
          if (isCancel(editedResult)) {
            outro(chalk.dim(msg.commit.processStopped))
            process.exit(0)
          }
          message = editedResult as string
          confirmed = true
        } else if (action === "regenerate") {
          if (!provider) {
            outro(chalk.red("Cannot regenerate: provider not available."))
            process.exit(1)
          }
          spinner.start(chalk.blue(msg.commit.regenerating))
          const stopRegen = createSlowSpinner(
            spinner,
            msg.commit.generatingSlow10,
            msg.commit.generatingSlow60
          )
          try {
            message = await provider.generateCommitMessage(
              diff,
              abortController.signal,
              { regenerate: true }
            )
            stopRegen()
            message = await ensureNonEmptyMessage(
              message,
              provider,
              diff,
              abortController.signal,
              spinner
            )
            spinner.succeed(chalk.green(msg.commit.regenerated))
          } catch (err: any) {
            stopRegen()
            spinner.fail(chalk.red(msg.commit.regenerationFailed(err.message)))
            if (err.name === "AbortError") {
              outro(chalk.yellow(msg.commit.generationCancelled))
              process.exit(0)
            }
          }
        } else {
          outro(chalk.dim(msg.commit.processStopped))
          process.exit(0)
        }
      }
    }

    // =========================================================
    // REMOTE CHECK
    // =========================================================
    if (!(await hasRemote())) {
      spinner.fail(chalk.red.bold(msg.common.noRemote.header))
      outro(chalk.yellow(msg.common.noRemote.instruction))
      process.exit(1)
    }

    // =========================================================
    // COMMIT + PUSH
    // =========================================================
    try {
      spinner.start(chalk.blue(msg.commit.committing))
      const stopCommit = createSlowSpinner(
        spinner,
        msg.commit.committingSlow10,
        msg.commit.committingSlow60
      )
      await git.commit(message)
      stopCommit()
      spinner.succeed(chalk.green(msg.common.success.committed))

      spinner.start(chalk.blue(msg.commit.pushing))
      const stopPush = createSlowSpinner(
        spinner,
        msg.commit.pushingSlow10,
        msg.commit.pushingSlow60
      )
      await git.push()
      stopPush()

      spinner.succeed(chalk.green.bold(msg.common.success.pushed))
      outro(chalk.green(msg.commit.outro))

      process.stdin.removeListener("data", handleKeyPress)
      process.stdin.setRawMode?.(false)
      process.stdin.pause()
      process.exit(0)
    } catch (error: any) {
      spinner.fail(chalk.red.bold(msg.commit.operationFailed))
      outro(chalk.red(handleError(error)))
      process.exit(1)
    }
  } catch (error: any) {
    if (error.name === "ExitPromptError" || error.name === "AbortError") {
      outro(chalk.red(msg.common.operationCancelled))
      process.exit(0)
    }
    handleError(error)
    process.exit(1)
  }
}
