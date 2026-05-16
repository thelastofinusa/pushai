import { Command } from "commander"
import { runReset } from "./commands/reset"
import { runConfig } from "./commands/config"
import { runCommit } from "./commands/commit"
import { version, name, description } from "../package.json"
import chalk from "chalk"
import { msg } from "./utils/msg"

let activeAbortController: AbortController | null = null

const program = new Command()

program
  .name(name)
  .description(description)
  .option("--dry-run", "Generate commit message but do not commit or push")
  .action(async (options) => {
    await runCommit(options.dryRun, (controller) => {
      activeAbortController = controller
    })
    activeAbortController = null
  })

program
  .name(name)
  .description(description)
  .version(version, "-v, --version", "output the version number")

program.action(async () => {
  await runCommit(false, (controller) => {
    activeAbortController = controller
  })
  activeAbortController = null
})

program
  .command("commit")
  .description("Stage changes, generate a message, and push")
  .option("--dry-run", "Generate commit message but do not commit or push")
  .action(async (options) => {
    await runCommit(options.dryRun, (controller) => {
      activeAbortController = controller
    })
    activeAbortController = null
  })

program
  .command("config")
  .description("Configure AI providers and API keys")
  .action(() => runConfig())

program
  .command("reset")
  .description("Delete the local config.json file")
  .action(() => runReset())

process.on("SIGINT", () => {
  console.log(chalk.yellow(msg.common.interrupted))
  if (activeAbortController) {
    activeAbortController.abort()
  } else {
    process.exit(0)
  }
})

program.parse()
