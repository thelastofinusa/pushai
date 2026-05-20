import color from "chalk"
import simpleGit from "simple-git"
import * as p from "@clack/prompts"

import { runConfig } from "./config"
import { Config } from "../types"
import { getAIProvider } from "../providers"
import { handleError } from "../utils/error"
import { getStoredConfig } from "../utils/config"
import { createSpinner, sleep } from "../utils/lib"
import { hasRemote, initRepo, prepareGitStage } from "../utils/git"
import { withTimedSpinner } from "../utils/loading"

const git = simpleGit()

export async function runCommit(
  dryRun?: boolean,
  autoPush?: boolean,
  userMessage?: string,
  onControllerCreate?: (controller: AbortController) => void
) {
  const s = createSpinner()

  try {
    const config = await getStoredConfig()
    if (!config.apiKey || !config.provider || !config.model) {
      await runConfig()
      Object.assign(config, await getStoredConfig())
      return
    }

    p.intro(
      `${color.cyan("●")} From ${color.bgCyan.black.bold(` ${config.provider.toUpperCase()} `)} ${color.dim("→")} ${color.white(config.model)}`
    )

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
        const msg = await withTimedSpinner({
          fn: async () => {
            provider = await getAIProvider(config as Config)
            return await provider.generateCommitMessage(diff)
          },
          initialMessage: `${color.cyanBright(config.model)} is generating commit message`,
          initialColor: "cyanBright",
          thresholds: [
            {
              afterMs: 1000, // 10s
              message: color.magenta("Please wait.. This might take a moment."),
              color: "magenta",
            },
            {
              afterMs: 3000, // 60s
              message: color.red("This is taking longer than usual"),
              color: "red",
            },
          ],
          successMessage: color.green("Message generated successfully."),
          errorMessage: color.red.bold("AI failed to generate commit message."),
          abortMessage: color.yellow("Commit message generation cancelled."),
        })

        message = msg
      } catch (error: any) {
        s.stop(color.red.bold("AI failed to generate commit message."))
        if (error.name === "AbortError") {
          p.outro(color.yellow("Commit message generation cancelled."))
          process.exit(0)
        }
        handleError(error)
        process.exit(1)
      }

      // dry run
      if (dryRun) {
        p.log.message(color.cyanBright("✓ " + message))
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
          p.log.message(color.cyanBright("✓ " + message))

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

            s.start(color.blue("Regenerating a new commit message"))
            await sleep(500)

            // message = await provider.generateCommitMessage(diff, abortController.signal)
            message = "refactor(spinner): switched from ora to @clack/prompts"

            s.message("Please wait.. This might take a moment.")
            await sleep(800)

            s.message("This is taking longer than usual")
            await sleep(1000)

            s.stop(color.green("New commit message ready."))
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
              message: color.magenta("Syncing changes"),
              color: "magenta",
            },
            {
              afterMs: 30_000,
              message: color.red("This is taking longer than usual"),
              color: "red",
            },
          ],
          successMessage: color.green("Changes pushed successfully."),
          errorMessage: color.red.bold("Failed to commit message"),
        })

        p.outro(color.cyan("✓ Successfully synced with the remote repository."))
        process.exit(0)
      } catch (error) {
        s.stop(
          color.red.bold("Something went wrong while completing the operation.")
        )
        p.outro(color.red(handleError(error)))
        process.exit(1)
      }
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

// export async function runCommit(
//   dryRun?: boolean,
//   autoPush?: boolean,
//   userMessage?: string,
//   onControllerCreate?: (controller: AbortController) => void
// ) {

//     // commit + push
//     try {
//       s.start(color.blue(msg.commit.committing))
//       const stopCommit = createSlowSpinner(
//         s,
//         msg.commit.committingSlow10,
//         msg.commit.committingSlow60
//       )
//       // await git.commit(message)
//       await new Promise((resolve) => setTimeout(resolve, 15000))
//       stopCommit()
//       s.stop(color.green(msg.common.success.committed))

//       s.start(color.blue(msg.commit.pushing))
//       const stopPush = createSlowSpinner(
//         s,
//         msg.commit.pushingSlow10,
//         msg.commit.pushingSlow60
//       )
//       // await git.push()
//       await new Promise((resolve) => setTimeout(resolve, 65000))
//       stopPush()
//       s.stop(color.green.bold(msg.common.success.pushed))

//       outro(color.green(msg.commit.outro))

//       process.stdin.removeListener("data", handleKeyPress)
//       process.stdin.setRawMode?.(false)
//       process.stdin.pause()
//       process.exit(0)
//     } catch (error: any) {
//       s.stop(color.red.bold(msg.commit.operationFailed))
//       outro(color.red(handleError(error)))
//       process.exit(1)
//     }
//   } catch (error: any) {
//     if (error.name === "ExitPromptError" || error.name === "AbortError") {
//       outro(color.red("Operation cancelled."))
//       process.exit(0)
//     }
//     handleError(error)
//     process.exit(1)
//   }
// }

// async function ensureNonEmptyMessage(
//   message: string,
//   provider: any,
//   diff: string,
//   abortSignal: AbortSignal,
//   s: ReturnType<typeof spinner>
// ): Promise<string> {
//   let current = message

//   while (!current || current.trim() === "") {
//     s.stop(color.red(msg.commit.emptyMessageTitle))

//     const action = await select({
//       message: msg.commit.emptyMessagePrompt,
//       options: [
//         { label: msg.commit.emptyRegenerate, value: "regenerate" },
//         { label: msg.commit.emptyManual, value: "manual" },
//         { label: msg.commit.emptyCancel, value: "cancel" },
//       ],
//     })

//     if (isCancel(action) || action === "cancel") {
//       outro(color.dim(msg.commit.processStopped))
//       process.exit(0)
//     }

//     if (action === "regenerate") {
//       s.start(color.blue(msg.commit.regenerating))
//       const stopSlow = createSlowSpinner(
//         s,
//         msg.commit.generatingSlow10,
//         msg.commit.generatingSlow60
//       )

//       try {
//         current = await provider.generateCommitMessage(diff, abortSignal, {
//           regenerate: true,
//         })
//         stopSlow()

//         if (!current || current.trim() === "") {
//           s.stop(color.yellow(msg.commit.stillEmptyWarning))
//           continue
//         }

//         s.stop(color.green(msg.commit.regenerated))
//       } catch (err: any) {
//         stopSlow()
//         s.stop(color.red(msg.commit.regenerationFailed(err.message)))
//         if (err.name === "AbortError") {
//           outro(color.yellow(msg.commit.generationCancelled))
//           process.exit(0)
//         }
//       }
//     } else if (action === "manual") {
//       const manualMsg = await text({
//         message: msg.commit.manualMessagePrompt,
//         validate: (value) =>
//           !value || value.trim() === ""
//             ? msg.commit.manualMessageRequired
//             : undefined,
//       })

//       if (isCancel(manualMsg)) {
//         outro(color.dim(msg.commit.processStopped))
//         process.exit(0)
//       }

//       current = manualMsg as string
//       log.success(color.green(msg.commit.manualAccepted))
//       // no spinner to stop here
//     }
//   }

//   return current
// }
