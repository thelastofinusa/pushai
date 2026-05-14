import { Command } from "commander"

import { runReset } from "./commands/reset"
import { runConfig } from "./commands/config"
import { runCommit } from "./commands/commit"
import { version, name, description } from "../package.json"

const program = new Command()

program.name(name).description(description).action(runCommit)

program
  .name(name)
  .description(description)
  .version(version, "-v, --version", "output the version number")

program
  .command("commit")
  .description("Stage changes, generate a message, and push")
  .action(runCommit)

program
  .command("config")
  .description("Configure AI providers and API keys")
  .action(runConfig)

program
  .command("reset")
  .description("Delete the local config.json file")
  .action(runReset)

program.parse()
