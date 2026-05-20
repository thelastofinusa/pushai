import {
  runConfig,
  runConfigEdit,
  runConfigPeek,
  runConfigProviders,
  runConfigSet,
} from "./commands/config"
import chalk from "chalk"
import { basename } from "path"
import { Command } from "commander"
import { msg } from "./constants/msg"
import { runReset } from "./commands/reset"
import { runCommit } from "./commands/commit"
import { version, description } from "../package.json"

let activeAbortController: AbortController | null = null

const program = new Command()

// Set dynamic name based on how it's invoked (pai or pushai)
const programName = basename(process.argv[1])
program.name(programName)
program.description(description)
program.version(version, "-v, --version", "output the version number")

// Default action (when no subcommand)
program.action(async () => {
  const args = process.argv.slice(2)
  const dryRun = args.includes("--dry-run")
  const autoPush = args.includes("-p") || args.includes("--push")
  // find message after -m or --message
  let userMessage: string | undefined
  const mIndex = args.findIndex((a) => a === "-m" || a === "--message")
  if (mIndex !== -1 && args[mIndex + 1]) {
    userMessage = args[mIndex + 1]
  }
  await runCommit(dryRun, autoPush, userMessage, (controller) => {
    activeAbortController = controller
  })
  activeAbortController = null
})

// Subcommands
program
  .command("config")
  .description("Configure AI providers and API keys")
  .option(
    "-p, --provider <provider>",
    "Set AI provider (gemini, openai, anthropic, e.t.c)"
  )
  .option("-m, --model <model>", "Set model ID")
  .option("-k, --key <apiKey>", "Set API key")
  .option("--peek", "Show current saved configuration without changing it")
  .option("-e, --edit", "Open configuration file in default editor")
  .action(async (options) => {
    if (options.edit) {
      await runConfigEdit()
    } else if (options.peek) {
      await runConfigPeek()
    } else if (options.provider || options.model || options.key) {
      await runConfigSet(options)
    } else {
      await runConfig()
    }
  })

program
  .command("commit")
  .description("Stage changes, generate a message, and push")
  .option("--dry-run", "Generate commit message but do not commit or push")
  .option("-p, --push", "Automatically commit and push without confirmation")
  .option(
    "-m, --message <msg>",
    "Use a custom commit message instead of generating with AI"
  )
  .action(async (options) => {
    const dryRun = options.dryRun || process.argv.includes("--dry-run")
    const autoPush =
      options.push ||
      process.argv.includes("-p") ||
      process.argv.includes("--push")
    const userMessage =
      options.message || process.argv.includes("-m")
        ? options.message
        : undefined

    await runCommit(dryRun, autoPush, userMessage, (controller) => {
      activeAbortController = controller
    })
    activeAbortController = null
  })

program
  .command("reset")
  .description("Delete the local config.json file")
  .option("-y, --yes", "Skip confirmation prompt")
  .action(async (options) => {
    const skipConfirm =
      options.yes ||
      process.argv.includes("-y") ||
      process.argv.includes("--yes")
    await runReset(skipConfirm)
  })

program
  .command("list")
  .description("List available AI providers and their models")
  .action(async () => {
    await runConfigProviders()
  })

process.on("SIGINT", () => {
  console.log(chalk.yellow(msg.common.interrupted))
  if (activeAbortController) {
    activeAbortController.abort()
  } else {
    process.exit(0)
  }
})

if (process.argv.length <= 2) {
  console.clear()
  program.help()
} else {
  console.clear()
  program.parse()
}
