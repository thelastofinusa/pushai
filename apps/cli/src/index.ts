import chalk from "chalk"
import { basename } from "path"
import { msg } from "./utils/msg"
import { Command } from "commander"
import { runReset } from "./commands/reset"
import { runConfig } from "./commands/config"
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

  await runCommit(dryRun, (controller) => {
    activeAbortController = controller
  })

  activeAbortController = null
})

// Subcommands
program
  .command("commit")
  .description("Stage changes, generate a message, and push")
  .option("--dry-run", "Generate commit message but do not commit or push")
  .action(async (options) => {
    const dryRun = process.argv.includes("--dry-run")

    await runCommit(dryRun, (controller) => {
      activeAbortController = controller
    })

    activeAbortController = null
  })

program
  .command("config")
  .description("Configure AI providers and API keys")
  .action(runConfig)

program
  .command("reset")
  .description("Delete the local config.json file")
  .action(runReset)

process.on("SIGINT", () => {
  console.log(chalk.yellow(msg.common.interrupted))
  if (activeAbortController) {
    activeAbortController.abort()
  } else {
    process.exit(0)
  }
})

program.parse()
