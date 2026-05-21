import { basename } from "path"
import { Command } from "commander"

import {
  runConfig,
  runConfigEdit,
  runConfigShow,
  runConfigSet,
} from "./commands/config"
import {
  runCommit,
  runCommitDry,
  runCommitMsg,
  runCommitPush,
} from "./commands/commit"
import { runList } from "./commands/list"
import { runReset } from "./commands/reset"
import { version, description } from "../package.json"

const program = new Command()

const programName = basename(process.argv[1])
program.name(programName)
program.description(description)
program.version(version, "-v, --version", "output the version number")

program
  .command("list")
  .description("browse available providers & models")
  .action(async () => await runList())

program
  .command("commit")
  .description("stage changes, generate a message, and push")
  .option("-d, --dry", "generate message only, no commit/push")
  .option("-p, --push", "skip confirmation, commit and push automatically")
  .option("-m, --msg <message>", "use custom commit message (skip generation)")
  .action(async (option) => {
    if (option.dry) return runCommitDry()
    if (option.push) return runCommitPush()
    if (option.msg) return runCommitMsg(option.msg)
    return runCommit()
  })

program
  .command("config")
  .description("configure AI providers and API keys")
  .option("-k, --key <apiKey>", "save or update your API key")
  .option("-m, --model <model>", "set model ID directly")
  .option("-p, --provider <provider>", "set AI provider (e.g. gemini, openai)")
  .option("-s, --show", "display the current configuration")
  .option("-e, --edit", "edit the configuration file manually")
  .action(async (options) => {
    if (options.edit) return runConfigEdit()
    if (options.show) return runConfigShow()
    if (options.provider || options.model || options.key)
      return runConfigSet(options)
    return runConfig()
  })

program
  .command("reset")
  .description("clear saved configuration and API keys")
  .option("-y, --yes", "skip confirmation and delete configuration")
  .option("-k, --key", "only delete the API key, keep provider/model")
  .action(async (options) => await runReset(options.yes, options.key))

if (process.argv.length <= 2) {
  console.clear()
  program.help()
} else {
  console.clear()
  program.parse()
}
