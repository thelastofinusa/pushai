import ora from "ora"
import chalk from "chalk"
import simpleGit from "simple-git"
import { confirm, input, select } from "@inquirer/prompts"

import { runConfig } from "./config"
import { getAIProvider } from "../providers"
import { handleError } from "../utils/error"
import { hasRemote, initRepo, prepareGitStage } from "../utils/git"
import { getStoredConfig } from "../utils/config"
import { Config } from "../types"

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
      const statusLine = `${chalk.bgCyan.black.bold(` ${providerName} `)} ${chalk.dim("•")} ${chalk.white(config.model)}`
      console.log(`\n${chalk.cyan("●")} ${statusLine}\n`)
    }

    let stageResult = await prepareGitStage()

    if (!stageResult.isRepo) {
      console.log(
        chalk.yellow("Git repository not found in the current directory.")
      )

      const shouldInit = await confirm({
        message: "Initialize a new Git repository here?",
        default: true,
      })

      if (shouldInit) {
        await initRepo()
        console.log(chalk.green("Git repository initialized successfully."))
        stageResult = await prepareGitStage()
      } else {
        console.log(
          chalk.dim(
            "\nCommand aborted. A Git repository is required to continue.\n"
          )
        )
        process.exit(0)
      }
    }

    const diff = stageResult.diff
    if (!diff) {
      console.log(
        chalk.red("There are no staged or unstaged changes to commit.")
      )
      process.exit(0)
    }

    const spinner = ora({ color: "cyan" })
    let message = ""
    let provider

    try {
      spinner.start(chalk.blue("Generating commit message..."))
      provider = await getAIProvider(config as Config)
      message = await provider.generateCommitMessage(
        diff,
        abortController.signal
      )
      spinner.succeed(chalk.green("Commit message generated."))
    } catch (error: any) {
      spinner.fail(chalk.red.bold("Commit message generation failed."))
      if (error.name === "AbortError") {
        console.log(chalk.yellow("\nGeneration was cancelled by the user.\n"))
        process.exit(0)
      }
      handleError(error)
      process.exit(1)
    }

    let confirmed = false

    while (!confirmed) {
      const line = "─".repeat(Math.max(message.length + 2, 20))

      console.log(`\n${chalk.cyan("┌" + line + "┐")}`)
      console.log(
        `${chalk.cyan("│")} ${chalk.bold(message)} ${chalk.cyan("│")}`
      )
      console.log(`${chalk.cyan("└" + line + "┘")}\n`)

      const action = await select({
        message: "Select how you want to continue:",
        choices: [
          { name: "Continue with Commit & Push", value: "accept" },
          { name: "Modify Commit Message", value: "edit" },
          { name: "Generate a Different Message", value: "regenerate" },
          { name: "Exit Without Pushing", value: "cancel" },
        ],
      })

      if (action === "accept") {
        confirmed = true
      } else if (action === "edit") {
        message = await input({
          message: "Refine commit message:",
          default: message,
        })
        confirmed = true
      } else if (action === "regenerate") {
        spinner.start(chalk.blue("Generating new message..."))
        try {
          message = await provider.generateCommitMessage(
            diff,
            abortController.signal
          )
          spinner.succeed(chalk.green("New commit message generated."))
        } catch (err: any) {
          spinner.fail(
            chalk.red(`Could not generate a new message: ${err.message}`)
          )
          if (err.name === "AbortError") {
            console.log(
              chalk.yellow("\nGeneration was cancelled by the user.\n")
            )
            process.exit(0)
          }
        }
      } else {
        console.log(
          chalk.dim("\nProcess stopped. No commits or pushes were made.\n")
        )
        process.exit(0)
      }
    }

    if (dryRun) {
      console.log(chalk.yellow("\n[DRY RUN] No commits or pushes were made.\n"))
      console.log(chalk.dim(`Proposed commit message:\n${message}\n`))
      process.exit(0)
    }

    if (!dryRun) {
      if (!(await hasRemote())) {
        spinner.fail(chalk.red.bold("No Git remote found."))
        console.log(
          chalk.yellow(
            "Please add a remote (e.g., `git remote add origin <url>`) and try again.\n"
          )
        )
        process.exit(1)
      }

      try {
        // 1. Commit phase
        spinner.start(chalk.blue("Committing changes..."))
        await git.commit(message)
        spinner.succeed(chalk.green("Changes committed."))

        // 2. Push phase
        spinner.start(chalk.blue("Pushing to remote..."))
        await git.push()
        spinner.succeed(
          chalk.green.bold("Repository updated and pushed successfully.\n")
        )
      } catch (error: any) {
        spinner.fail(chalk.red.bold("Operation failed."))
        console.log(chalk.red(`\nGit reported an error: ${error.message}\n`))
        process.exit(1)
      }
    }
  } catch (error: any) {
    if (error.name === "ExitPromptError" || error.name === "AbortError") {
      console.log(chalk.dim("\nOperation cancelled.\n"))
      process.exit(0)
    }
    handleError(error)
    process.exit(1)
  } finally {
    onControllerCreate?.(null as any)
  }
}
