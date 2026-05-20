import color from "chalk"
import simpleGit from "simple-git"
import * as p from "@clack/prompts"

import { runConfig } from "./config"
import { Config } from "../types"
import { getAIProvider } from "../providers"
import { handleError } from "../utils/error"
import { getStoredConfig } from "../utils/config"
import { hasRemote, initRepo, prepareGitStage } from "../utils/git"
import { createSpinner, withTimedSpinner } from "../utils/loading"
import { renderIntro, sleep } from "../utils/lib"
import { aiProviders } from "../providers/models"

const git = simpleGit()

export async function runCommit(
  dryRun?: boolean,
  autoPush?: boolean,
  userMessage?: string
) {
  const s = createSpinner()

  try {
    const config = await getStoredConfig()
    if (!config.apiKey || !config.provider || !config.model) {
      await runConfig()
      Object.assign(config, await getStoredConfig())
      await sleep(800)
      console.clear()
    }

    renderIntro({
      badge: "PushAI Commit",
      title: `${
        aiProviders.find((p) => p.value === config.provider)?.name ||
        config.provider
      } session initialized`,
    })

    let stageResult = await prepareGitStage()
    if (!stageResult.isRepo) {
      p.log.warn(color.yellow("There's no Git repository in this directory."))
      const shouldInit = await p.confirm({
        message: "Would you like to initialize a new Git repository?",
        initialValue: true,
      })
      if (p.isCancel(shouldInit)) {
        p.outro(color.red("Operation cancelled."))
        process.exit(0)
      }
      if (shouldInit) {
        await initRepo()
        p.log.success(color.green("Git repository initialized successfully."))
        stageResult = await prepareGitStage()
      } else {
        p.outro(color.dim("A Git repository is required to continue."))
        process.exit(0)
      }
    }

    const diff = stageResult.diff
    if (!diff) {
      p.outro(color.red("No changes were found to commit."))
      process.exit(0)
    }

    let message = ""
    let provider

    // user-provided message (skip AI)
    if (userMessage) {
      message = userMessage.trim()
      if (!message) {
        p.log.error(color.red("Empty user message provided."))
        p.outro(color.red("Please provide a non-empty commit message."))
        process.exit(1)
      }
      s.start(color.blue("Using provided commit message."))
      await new Promise((resolve) => setTimeout(resolve, 300))
      s.stop(color.green("User message accepted."))
    } else {
      // AI generation
      try {
        provider = await getAIProvider(config as Config)
        let genProvider = provider
        const msg = await withTimedSpinner({
          fn: async () => {
            return await genProvider.generateCommitMessage(diff)
          },
          initialMessage: `${color.cyanBright(config.model)} is generating commit message`,
          initialColor: "cyanBright",
          thresholds: [
            {
              afterMs: 10_000, // 10s
              message: color.yellow("Please wait.. This might take a moment"),
              color: "yellow",
            },
            {
              afterMs: 30_000, // 30s
              message: color.red("This is taking longer than usual"),
              color: "red",
            },
          ],
          successMessage: color.green("Message generated successfully."),
          errorMessage: color.red.bold("AI failed to generate commit message."),
          abortMessage: color.yellow("Commit message generation cancelled."),
        })

        message = msg
        message = await ensureNonEmptyMessage(message, provider, diff, s)
      } catch (error: any) {
        if (error.name === "AbortError") {
          p.outro(color.yellow("Commit message generation cancelled."))
          process.exit(0)
        }
        handleError(error)
        process.exit(1)
      }
    }

    // dry run
    if (dryRun) {
      p.log.message(color.cyanBright("◆ " + message))
      p.outro(color.dim("[DRY RUN] No changes were committed or pushed."))
      process.exit(0)
    }

    // confirmation loop
    let confirmed = false
    if (autoPush) {
      confirmed = true
    } else {
      // confirmation loop
      while (!confirmed) {
        p.log.message(color.cyanBright("◆ " + message))

        const actionResult = await p.select({
          message: "What should we do with this commit?",
          options: [
            {
              label: "Commit & push",
              value: "accept",
              hint: "Stage commit and push to remote",
            },
            {
              label: "Edit message",
              value: "edit",
              hint: "Modify the generated commit message",
            },
            {
              label: "Regenerate",
              value: "regenerate",
              hint: "Generate a new AI commit message",
            },
            {
              label: "Cancel",
              value: "cancel",
              hint: "Abort without saving changes",
            },
          ],
        })
        if (p.isCancel(actionResult)) {
          p.outro(color.dim("No changes were committed or pushed."))
          process.exit(0)
        }
        const action = actionResult as string

        if (action === "accept") {
          confirmed = true
        } else if (action === "edit") {
          const editedResult = await p.text({
            message: "Update the commit message:",
            initialValue: message,
          })
          if (p.isCancel(editedResult)) {
            p.outro(color.dim("No changes were committed or pushed."))
            process.exit(0)
          }
          message = editedResult as string
          confirmed = true
        } else if (action === "regenerate") {
          if (!provider) {
            p.outro(color.red("Cannot regenerate: provider not available."))
            process.exit(1)
          }
          let genProvider = provider
          const msg = await withTimedSpinner({
            fn: async () => {
              return await genProvider.generateCommitMessage(diff, {
                regenerate: true,
              })
            },
            initialMessage: color.cyanBright(
              "Regenerating a new commit message"
            ),
            initialColor: "cyanBright",
            thresholds: [
              {
                afterMs: 10_000, // 10s
                message: color.yellow("Please wait.. This might take a moment"),
                color: "yellow",
              },
              {
                afterMs: 30_000, // 30s
                message: color.red("This is taking longer than usual"),
                color: "red",
              },
            ],
            successMessage: color.green("New commit message ready."),
            errorMessage: color.red.bold(
              "AI failed to generate commit message."
            ),
            abortMessage: color.yellow("Commit message generation cancelled."),
          })

          message = msg
          message = await ensureNonEmptyMessage(message, provider, diff, s)
        } else {
          p.outro(color.dim("No action taken. Commit flow exited safely."))
          process.exit(0)
        }
      }
    }

    // remote check
    if (!(await hasRemote())) {
      p.log.error("No remote repository found.")
      p.outro(
        color.yellow(
          "Add a remote (e.g. `git remote add origin <url>`) and try again."
        )
      )
      process.exit(1)
    }

    // commit + push
    try {
      await withTimedSpinner({
        fn: async () => {
          await git.commit(message)
          await git.push()
        },
        initialMessage: "Pushing changes to remote",
        initialColor: "cyanBright",
        thresholds: [
          {
            afterMs: 10_000,
            message: color.yellow("Syncing changes"),
            color: "yellow",
          },
          {
            afterMs: 30_000,
            message: color.red("This is taking longer than usual"),
            color: "red",
          },
        ],
        successMessage: color.green("Changes pushed successfully."),
        errorMessage: color.red.bold(
          "Something went wrong while completing the operation."
        ),
      })

      p.outro(color.cyan("✓ Successfully synced with the remote repository."))
      process.exit(0)
    } catch (error) {
      p.outro(color.red(handleError(error)))
      process.exit(1)
    }
  } catch (error: any) {
    if (error.name === "ExitPromptError" || error.name === "AbortError") {
      p.outro(color.red("Operation cancelled."))
      process.exit(0)
    }
    handleError(error)
    process.exit(1)
  }
}

async function ensureNonEmptyMessage(
  message: string,
  provider: any,
  diff: string,
  s: ReturnType<typeof createSpinner>
): Promise<string> {
  let current = message

  while (!current || current.trim() === "") {
    s.stop(color.red("Empty commit message"))

    const action = await p.select({
      message:
        "AI returned an empty commit message. What would you like to do?",
      options: [
        { label: "Regenerate", value: "regenerate" },
        { label: "Enter manually", value: "manual" },
        { label: "Cancel", value: "cancel" },
      ],
    })

    if (p.isCancel(action) || action === "cancel") {
      p.outro(color.dim("No changes were committed or pushed."))
      process.exit(0)
    }

    if (action === "regenerate") {
      try {
        await withTimedSpinner({
          fn: async () => {
            current = await provider.generateCommitMessage(diff, {
              regenerate: true,
            })
          },
          initialMessage: "Regenerating a new commit message",
          initialColor: "cyanBright",
          thresholds: [
            {
              afterMs: 10_000,
              message: color.yellow("Please wait.. This might take a moment"),
              color: "yellow",
            },
            {
              afterMs: 30_000,
              message: color.red("This is taking longer than usual"),
              color: "red",
            },
          ],
          successMessage: color.green("New commit message ready."),
          errorMessage: color.red.bold("Couldn't generate another message"),
        })

        if (!current || current.trim() === "") {
          s.stop(color.yellow("Still empty, try manual entry."))
          continue
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          p.outro(color.yellow("Commit message generation cancelled."))
          process.exit(0)
        }
      }
    } else if (action === "manual") {
      const manualMsg = await p.text({
        message: "Enter commit message manually:",
        validate: (value) =>
          !value || value.trim() === "" ? "Message cannot be empty" : undefined,
      })

      if (p.isCancel(manualMsg)) {
        p.outro(color.dim("No changes were committed or pushed."))
        process.exit(0)
      }

      current = manualMsg as string
      p.log.success(color.green("Manual message accepted."))
      // no spinner to stop here
    }
  }

  return current
}
