import chalk from "chalk"
import {
  select,
  password,
  isCancel,
  text,
  intro,
  note,
  outro,
} from "@clack/prompts"
import { getConfigPath, setStoredConfig } from "../utils/config"
import { aiProviders } from "../providers"
import { ProviderType } from "../types"
import { msg } from "../utils/msg"

export async function runConfig() {
  intro(chalk.blue.bold(msg.config.intro))

  try {
    const providerResult = await select({
      message: msg.config.providerPrompt,
      options: aiProviders.map((p) => ({ label: p.name, value: p.value })),
    })

    if (isCancel(providerResult)) {
      outro(chalk.red(msg.common.operationCancelled))
      return
    }

    const provider = providerResult as ProviderType
    const selectedProvider = aiProviders.find((p) => p.value === provider)

    const apiKeyResult = await password({
      message: msg.config.apiKeyPrompt(provider),
      mask: "*",
      validate: (value) => {
        if (!value || value.trim() === "") {
          return msg.config.apiKeyRequired
        }
        return undefined
      },
    })

    if (isCancel(apiKeyResult)) {
      outro(chalk.red(msg.common.operationCancelled))
      return
    }

    const apiKey = apiKeyResult as string

    // 1. Select from recommended models
    let modelResult = await select({
      message: msg.config.modelPrompt,
      options: [
        ...(selectedProvider?.models.map((m) => ({
          label: m.name,
          value: m.value,
          hint: m.hint,
        })) || []),
        { label: msg.config.customModelSeparator, value: "custom_id" },
      ],
    })

    if (isCancel(modelResult)) {
      outro(chalk.red(msg.common.operationCancelled))
      return
    }

    let model = modelResult as string

    // 2. If they chose custom, ask for the string
    if (model === "custom_id") {
      const customModelResult = await text({
        message: msg.config.customModelPrompt,
        placeholder: "...",
        validate: (value) => {
          if (!value || value.trim() === "") {
            return msg.config.customModelRequired
          }
          return undefined
        },
      })

      if (isCancel(customModelResult)) {
        outro(chalk.red(msg.common.operationCancelled))
        return
      }

      model = customModelResult as string
    }

    await setStoredConfig({
      provider,
      apiKey,
      model,
    })

    const configPath = getConfigPath()

    // Build configuration details as a multiline string
    const configDetails = `${msg.config.providerLabel(
      aiProviders.find((ai) => provider === ai.value)?.name || provider
    )}
${msg.config.modelLabel(model)}
${msg.config.apiKeyLabel(apiKey.slice(-4))}
${chalk.dim(msg.config.configFile(configPath))}`

    // Display the configuration in a nice box
    note(configDetails, chalk.cyan(msg.config.saved))

    // Build commands guide as a multiline string
    const commandsGuide = `${chalk.white.bold("pai commit:")} ${chalk.white(msg.config.hintCommit)}
${chalk.white.bold("pai config:")} ${chalk.white(msg.config.hintConfig)}
${chalk.white.bold("pai reset:")}  ${chalk.white(msg.config.hintReset)}`

    // Display the commands guide in a nice box
    note(commandsGuide, chalk.cyan(msg.config.commandsHint))

    outro(chalk.green.bold(msg.config.outro))
  } catch (error: any) {
    if (error.name === "ExitPromptError") {
      console.log(chalk.dim(msg.common.operationCancelled))
      return // Exit the function without crashing
    }
    throw error
  }
}
