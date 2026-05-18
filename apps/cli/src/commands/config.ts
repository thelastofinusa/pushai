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
import { msg } from "../constants/msg"
import { Config, ProviderType } from "../types"
import { aiProviders } from "../providers/models"
import {
  getConfigPath,
  getStoredConfig,
  setStoredConfig,
} from "../utils/config"
import { spawn } from "child_process"

export async function runConfigEdit() {
  intro(chalk.blue("Opening configuration file"))

  try {
    const configPath = getConfigPath()
    const editor = process.env.EDITOR || process.env.VISUAL || "vim"

    await new Promise<void>((resolve, reject) => {
      const child = spawn(editor, [configPath], { stdio: "inherit" })
      child.on("close", (code: number) => {
        if (code === 0) resolve()
        else reject(new Error(`Editor exited with code ${code}`))
      })
      child.on("error", reject)
    })
    outro(
      chalk.green(
        `✓ Configuration file edited. Use \`pai config --peek\` to see new values.`
      )
    )
  } catch (error: any) {
    outro(chalk.red(`Failed to open editor: ${error.message}`))
  }
}

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

    const configDetails = `${msg.config.providerLabel(
      aiProviders.find((ai) => provider === ai.value)?.name || provider
    )}
${msg.config.modelLabel(model)}
${msg.config.apiKeyLabel(apiKey.slice(-4))}
${chalk.dim(msg.config.configFile(configPath))}`

    note(configDetails, chalk.cyan(msg.config.saved))

    const commandsGuide = `${chalk.white.bold("pai commit:")} ${chalk.white(msg.config.hintCommit)}
${chalk.white.bold("pai config:")} ${chalk.white(msg.config.hintConfig)}
${chalk.white.bold("pai reset:")}  ${chalk.white(msg.config.hintReset)}`

    note(commandsGuide, chalk.cyan(msg.config.commandsHint))
    outro(chalk.green.bold(msg.config.outro))
  } catch (error: any) {
    if (error.name === "ExitPromptError") {
      console.log(chalk.dim(msg.common.operationCancelled))
      return
    }
    throw error
  }
}

export async function runConfigSet(options: {
  provider?: string
  model?: string
  key?: string
}) {
  intro(chalk.blue(msg.config.updateIntro))

  try {
    const current = await getStoredConfig()
    const updates: Partial<Config> = {}

    if (options.provider) {
      const validProviders = aiProviders.map((p) => p.value)
      if (!validProviders.includes(options.provider as ProviderType)) {
        outro(
          chalk.red(
            `Invalid provider. Use one of: ${validProviders.join(", ")}`
          )
        )
        return
      }
      updates.provider = options.provider as ProviderType
    }

    if (options.model) updates.model = options.model
    if (options.key) updates.apiKey = options.key

    if (Object.keys(updates).length === 0) {
      outro(chalk.yellow(msg.config.noValuesProvided))
      return
    }

    await setStoredConfig({ ...current, ...updates })

    const newConfig = await getStoredConfig()
    const configPath = getConfigPath()

    const providerName =
      aiProviders.find((p) => p.value === newConfig.provider)?.name ||
      newConfig.provider ||
      msg.config.notSet
    const modelDisplay = newConfig.model || msg.config.notSet
    const apiKeyDisplay = newConfig.apiKey
      ? `****${newConfig.apiKey.slice(-4)}`
      : msg.config.notSet

    const configDetails = `${msg.config.providerLabel(providerName)}
${msg.config.modelLabel(modelDisplay)}
${msg.config.apiKeyLabel(apiKeyDisplay)}
${chalk.dim(msg.config.configFile(configPath))}`

    note(configDetails)
    outro(chalk.green.bold(msg.config.updateOutro))
  } catch (error: any) {
    if (error.name !== "ExitPromptError") {
      outro(chalk.red(`Failed to update config: ${error.message}`))
    }
  }
}

export async function runConfigPeek() {
  intro(chalk.blue(msg.config.peekIntro))

  try {
    const config = await getStoredConfig()
    const configPath = getConfigPath()

    const providerName =
      aiProviders.find((p) => p.value === config.provider)?.name ||
      config.provider ||
      msg.config.notSet
    const modelDisplay = config.model || msg.config.notSet
    const apiKeyDisplay = config.apiKey
      ? `****${config.apiKey.slice(-4)}`
      : msg.config.notSet

    const configDetails = `${msg.config.providerLabel(providerName)}
${msg.config.modelLabel(modelDisplay)}
${msg.config.apiKeyLabel(apiKeyDisplay)}
${chalk.dim(msg.config.configFile(configPath))}`

    note(configDetails)
    outro(chalk.green(msg.config.peekOutro))
  } catch (error: any) {
    if (error.name !== "ExitPromptError") {
      outro(chalk.red(`Failed to peek config: ${error.message}`))
    }
  }
}

export async function runConfigProviders() {
  intro(chalk.blue(msg.config.providersIntro))

  for (const provider of aiProviders) {
    const modelLines = provider.models
      .map((model) => {
        const hintText = model.hint ? `: ${model.hint}` : ""
        return `  ${chalk.dim(model.value)}${hintText}`
      })
      .join("\n")

    const content = modelLines || chalk.dim(msg.config.noModels)
    const title = chalk.cyan(msg.config.providerTitle(provider.name))
    note(content, title)
  }

  outro(msg.config.providersOutro)
}
