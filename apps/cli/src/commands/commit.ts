import ora from "ora"
import chalk from "chalk"
import simpleGit from "simple-git"
import { confirm, select, text, isCancel, note, outro } from "@clack/prompts"
import { runConfig } from "./config"
import { getAIProvider } from "../providers"
import { handleError } from "../utils/error"
import { hasRemote, initRepo, prepareGitStage } from "../utils/git"
import { getStoredConfig } from "../utils/config"
import { Config } from "../types"
import { msg } from "../utils/msg"

const git = simpleGit()

export async function runCommit(
  dryRun = false,
  onControllerCreate?: (controller: AbortController) => void
) {
  const abortController = new AbortController()
  onControllerCreate?.(abortController)

  try {
    const config = await getStoredConfig()

    if (!config.apiKey || !config.provider || !config.model) {
      await runConfig()
      Object.assign(config, await getStoredConfig())
      return
    } else {
      const providerName = config.provider.toUpperCase()
      console.log(msg.commit.intro(providerName, config.model))
    }

    let stageResult = await prepareGitStage()

    if (!stageResult.isRepo) {
      console.log(chalk.yellow(msg.commit.gitRepoMissing))

      const shouldInitResult = await confirm({
        message: msg.commit.initConfirm,
        initialValue: true,
      })

      if (isCancel(shouldInitResult)) {
        outro(chalk.red(msg.common.operationCancelled))
        process.exit(0)
      }

      if (shouldInitResult) {
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

    try {
      spinner.start(chalk.blue(msg.commit.generating))
      provider = await getAIProvider(config as Config)
      message = await provider.generateCommitMessage(
        diff,
        abortController.signal
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

    let confirmed = false

    while (!confirmed) {
      // Display the commit message in a styled note
      note(chalk.bold(message), msg.commit.noteTitle)

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
        spinner.start(chalk.blue(msg.commit.regenerating))
        try {
          message = await provider.generateCommitMessage(
            diff,
            abortController.signal,
            { regenerate: true }
          )
          spinner.succeed(chalk.green(msg.commit.regenerated))
        } catch (err: any) {
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

    if (dryRun) {
      note(
        chalk.dim(msg.common.dryRun.proposed(message)),
        chalk.yellow(msg.common.dryRun.header)
      )
      process.exit(0)
    }

    if (!dryRun) {
      if (!(await hasRemote())) {
        spinner.fail(chalk.red.bold(msg.common.noRemote.header))
        outro(chalk.yellow(msg.common.noRemote.instruction))
        process.exit(1)
      }

      try {
        spinner.start(chalk.blue(msg.commit.committing))
        await git.commit(message)
        await new Promise((resolve) => setTimeout(resolve, 2000))
        spinner.succeed(chalk.green(msg.common.success.committed))

        spinner.start(chalk.blue(msg.commit.pushing))
        TODO: await git.push()
        spinner.succeed(chalk.green.bold(msg.common.success.pushed))

        // Successful completion
        outro(chalk.green(msg.commit.outro))
      } catch (error: any) {
        spinner.fail(chalk.red.bold(msg.commit.operationFailed))
        outro(chalk.red(msg.commit.gitError(error.message)))
        process.exit(1)
      }
    }
  } catch (error: any) {
    if (error.name === "ExitPromptError" || error.name === "AbortError") {
      outro(chalk.red(msg.common.operationCancelled))
      process.exit(0)
    }
    handleError(error)
    process.exit(1)
  } finally {
    onControllerCreate?.(null as any)
  }
}
