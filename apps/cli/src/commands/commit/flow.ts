import fs from "fs"
import color from "chalk"
import * as p from "@clack/prompts"

import { AIProvider, Config } from "../../types"
import { getAIProvider } from "../../providers"
import { getStoredConfig } from "../../lib/storage"
import { getReadableError, renderIntro, sleep } from "../../lib/utils"
import { aiProviders } from "../../providers/models"
import { createSpinner, withTimedSpinner } from "../../lib/loading"
import { git, hasRemote, initRepo, prepareGitStage } from "../../lib/git"
import { runConfigSmart } from "../config"

export type CommitFlowOptions = {
  autoPush?: boolean
  dry?: boolean
  message?: string
}

/* ------------------------------------------------------------------ */
/*  Main entry point                                                  */
/* ------------------------------------------------------------------ */

export async function runCommitFlow(options: CommitFlowOptions = {}) {
  const { autoPush = false, dry = false, message: userMessage } = options

  // 1. Config & intro
  const config = await getStoredConfig()
  const missing = []
  if (!config.provider) missing.push("provider")
  if (!config.model) missing.push("model")
  if (!config.apiKey) missing.push("api-key")

  if (missing.length > 0) {
    // Show a config‑oriented intro with warning colors
    renderIntro({
      badge: "Setup Required",
      title: `Incomplete configuration: ${missing.join(", ")}`,
      badgeBgColor: "bgYellow",
      iconColor: "yellow",
    })
    // Only prompt for missing fields
    const updatedConfig = await runConfigSmart(config)
    Object.assign(config, updatedConfig)
    await sleep(500)
    console.clear()
  }

  // Always show the commit intro after config is ready (whether it was missing or not)
  renderIntro({
    badge: "PushAI Commit",
    title: `${
      aiProviders.find((p) => p.value === config.provider)?.name ||
      config.provider
    } session initialized`,
  })

  // 2. Git staging & diff
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

      // Check if any files exist (except .git folder)
      const files = fs.readdirSync(process.cwd()).filter((f) => f !== ".git")
      if (files.length === 0) {
        const createReadme = await p.confirm({
          message: "Repository is empty. Create an initial README.md?",
          initialValue: true,
        })
        if (createReadme && !p.isCancel(createReadme)) {
          fs.writeFileSync("README.md", "# My Project\n\nInitial commit")
          await git.add("README.md")
          p.log.success("README.md created and staged.")
        }
      }

      stageResult = await prepareGitStage()
    }
  }

  const diff = stageResult.diff
  if (!diff) {
    p.outro(color.red("No changes were found to commit."))
    process.exit(0)
  }

  // 3. Obtain commit message (AI or user‑provided)
  let message = ""
  if (userMessage) {
    message = userMessage.trim()
    if (!message) {
      p.log.error(color.red("Empty user message provided."))
      p.outro(color.red("Please provide a non-empty commit message."))
      process.exit(1)
    }
    const s = createSpinner()
    s.start(color.blue("Using provided commit message."))
    await sleep(300)
    s.stop(color.green("User message accepted."))
  } else {
    const provider = await getAIProvider(config as Config)
    try {
      message = await generateInitialMessage(provider, diff, config.model!)
      message = await ensureNonEmptyMessage(message, provider, diff)
    } catch (error) {
      // Spinner already displayed "AI failed to generate commit message."
      // Now show the specific reason and exit cleanly.
      p.outro(color.red(getReadableError(error)))
      process.exit(1)
    }
  }

  // 4. Dry run
  if (dry) {
    p.log.message(color.cyanBright("◆ " + message))
    p.outro(color.dim("[DRY RUN] No changes were committed or pushed."))
    process.exit(0)
  }

  // 5. Confirmation (skip if autoPush)
  if (!autoPush) {
    const provider = await getAIProvider(config as Config)
    message = await confirmMessage(message, provider, diff)
  }

  // 6. Remote & upstream check
  if (!(await hasRemote())) {
    p.log.error("No remote repository found.")
    p.outro(
      color.yellow(
        "Add a remote (e.g. `git remote add origin <url>`) and try again."
      )
    )
    process.exit(1)
  }

  // Ensure current branch has an upstream
  const currentBranch = await git.revparse(["--abbrev-ref", "HEAD"])
  const upstream = await git.getConfig(`branch.${currentBranch}.remote`)
  if (!upstream.value) {
    p.log.warn(
      color.yellow(`Branch "${currentBranch}" has no upstream remote.`)
    )
    const setUpstream = await p.confirm({
      message: `Set upstream to "origin/${currentBranch}"?`,
      initialValue: true,
    })
    if (setUpstream && !p.isCancel(setUpstream)) {
      await git.branch([
        "--set-upstream-to=origin/" + currentBranch,
        currentBranch,
      ])
      p.log.success("Upstream set.")
    } else {
      p.outro(color.dim("Push aborted – please set upstream manually."))
      process.exit(0)
    }
  }

  // 7. Commit & push
  try {
    await pushChanges(message)
  } catch (error) {
    p.outro(color.red(getReadableError(error)))
    process.exit(1)
  }

  p.outro(color.cyan("✓ Successfully synced with the remote repository."))
  process.exit(0)
}

/* ------------------------------------------------------------------ */
/*  Generation helpers                                                */
/* ------------------------------------------------------------------ */

async function generateInitialMessage(
  provider: AIProvider,
  diff: string,
  model: string
): Promise<string> {
  return withTimedSpinner({
    fn: () => provider.generateCommitMessage(diff),
    initialMessage: `${color.cyanBright(model)} is generating commit message`,
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
    successMessage: color.green("Message generated successfully."),
    abortMessage: color.yellow("Commit message generation cancelled."),
  })
}

async function regenerateMessage(
  provider: AIProvider,
  diff: string
): Promise<string> {
  try {
    return await withTimedSpinner({
      fn: () => provider.generateCommitMessage(diff, { regenerate: true }),
      initialMessage: color.cyanBright("Regenerating a new commit message"),
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
      abortMessage: color.yellow("Commit message generation cancelled."),
    })
  } catch (error: any) {
    p.outro(color.red(getReadableError(error)))
    process.exit(1)
  }
}

async function pushChanges(message: string) {
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
  })
}

/* ------------------------------------------------------------------ */
/*  Confirmation loop                                                 */
/* ------------------------------------------------------------------ */

async function confirmMessage(
  currentMessage: string,
  provider: AIProvider,
  diff: string
): Promise<string> {
  let message = currentMessage
  while (true) {
    p.log.message(color.cyanBright("◆ " + message))

    const action = await p.select({
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

    if (p.isCancel(action)) {
      p.outro(color.dim("No changes were committed or pushed."))
      process.exit(0)
    }

    switch (action) {
      case "accept":
        return message
      case "edit": {
        const edited = await p.text({
          message: "Update the commit message:",
          initialValue: message,
        })
        if (p.isCancel(edited)) {
          p.outro(color.dim("No changes were committed or pushed."))
          process.exit(0)
        }
        message = edited as string
        break
      }
      case "regenerate": {
        // regenerateMessage will exit on error, so no need to try/catch here
        message = await regenerateMessage(provider, diff)
        message = await ensureNonEmptyMessage(message, provider, diff)
        break
      }
      case "cancel":
        p.outro(color.dim("No action taken. Commit flow exited safely."))
        process.exit(0)
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Empty message guard                                               */
/* ------------------------------------------------------------------ */

async function ensureNonEmptyMessage(
  current: string,
  provider: AIProvider,
  diff: string
): Promise<string> {
  let message = current
  while (!message || message.trim() === "") {
    p.log.error(color.red("AI returned an empty commit message."))

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
        message = await regenerateMessage(provider, diff)
      } catch (err: any) {
        // If regenerateMessage threw instead of exiting (shouldn't happen now),
        // we still catch gracefully.
        if (err.name === "AbortError") {
          p.outro(color.yellow("Commit message generation cancelled."))
          process.exit(0)
        }
        p.outro(color.red(getReadableError(err)))
        process.exit(1)
      }
      if (!message || message.trim() === "") {
        p.log.warn(color.yellow("Still empty – try manual entry."))
        continue
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
      message = manualMsg as string
      p.log.success(color.green("Manual message accepted."))
    }
  }
  return message
}
