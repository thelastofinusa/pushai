import ora from "ora"
import chalk from "chalk"
import simpleGit from "simple-git"
import { confirm, input, select } from "@inquirer/prompts"

import { runConfig } from "./config"
import { getAIProvider } from "../providers"
import { handleError } from "../utils/error"
import { initRepo, prepareGitStage } from "../utils/git"
import { getStoredConfig } from "../utils/config"

const git = simpleGit()

export async function runCommit() {
  try {
    const config = getStoredConfig()

    if (!config.apiKey) {
      await runConfig()
      Object.assign(config, getStoredConfig())
    } else {
      console.log(
        chalk.dim(
          `Active provider: ${config.provider} • Model: ${config.model}`
        )
      )
    }

    // Check repository state
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

        // Re-run after initialization
        stageResult = await prepareGitStage()
      } else {
        console.log(
          chalk.dim(
            "\nCommand aborted. A Git repository is required to continue."
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

    // Generate initial commit message
    try {
      spinner.start(chalk.blue("Generating commit message..."))

      provider = getAIProvider(config)

      message = await provider.generateCommitMessage(diff)

      spinner.succeed(chalk.green("Commit message generated."))
    } catch (error: any) {
      spinner.fail(chalk.red.bold("Commit message generation failed."))

      handleError(error)
      process.exit(1)
    }

    // Interactive confirmation loop
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
          {
            name: "Continue with Commit & Push",
            value: "accept",
          },
          {
            name: "Modify Commit Message",
            value: "edit",
          },
          {
            name: "Generate a Different Message",
            value: "regenerate",
          },
          {
            name: "Exit Without Pushing",
            value: "cancel",
          },
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
          message = await provider.generateCommitMessage(diff)

          spinner.succeed(chalk.green("New commit message generated."))
        } catch (err: any) {
          spinner.fail(
            chalk.red(`Could not generate a new message: ${err.message}`)
          )
        }
      } else {
        console.log(
          chalk.dim("\nProcess stopped. No commits or pushes were made.\n")
        )

        process.exit(0)
      }
    }

    // Commit and push
    try {
      spinner.start(chalk.blue("Pushing changes..."))

      await git.commit(message)
      await git.push()

      spinner.succeed(
        chalk.green.bold("Repository updated and pushed successfully.")
      )
    } catch (error: any) {
      spinner.fail(chalk.red.bold("Push operation could not be completed."))

      console.log(chalk.red(`\nGit reported an error: ${error.message}\n`))

      process.exit(1)
    }
  } catch (error: any) {
    if (error.name === "ExitPromptError") {
      console.log(chalk.dim("\nExited by user request.\n"))

      process.exit(0)
    }

    handleError(error)
    process.exit(1)
  }
}
