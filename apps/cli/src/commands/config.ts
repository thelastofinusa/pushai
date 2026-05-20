import color from "chalk"
import * as p from "@clack/prompts"
import { Config, ProviderType } from "../types"
import { aiProviders } from "../providers/models"
import {
  getConfigPath,
  getStoredConfig,
  setStoredConfig,
} from "../utils/config"
import { spawn } from "child_process"
import { renderIntro } from "../utils/lib"

export async function runConfig() {
  renderIntro({
    badge: "PushAI Config",
    title: "Set up your AI provider and model",
  })

  try {
    const providerResult = await p.select({
      message: "Choose from the available AI providers:",
      options: aiProviders.map((p) => ({ label: p.name, value: p.value })),
    })

    if (p.isCancel(providerResult)) {
      p.outro(color.red("Operation cancelled."))
      return
    }

    const provider = providerResult as ProviderType
    const selectedProvider = aiProviders.find((p) => p.value === provider)

    const apiKeyResult = await p.password({
      message: `Enter your ${color.cyan.bold(provider)} API key:`,
      mask: "*",
      validate: (value) => {
        if (!value || value.trim() === "") {
          return "You'll need an API key to continue."
        }
        return undefined
      },
    })

    if (p.isCancel(apiKeyResult)) {
      p.outro(color.red("Operation cancelled."))
      return
    }

    const apiKey = apiKeyResult as string

    let modelResult = await p.select({
      message: "Which model would you like to use?",
      options: [
        ...(selectedProvider?.models.map((m) => ({
          label: m.name,
          value: m.value,
          hint: m.hint,
        })) || []),
        { label: "Use a custom model ID", value: "custom_id" },
      ],
    })

    if (p.isCancel(modelResult)) {
      p.outro(color.red("Operation cancelled."))
      return
    }

    let model = modelResult as string

    if (model === "custom_id") {
      const customModelResult = await p.text({
        message: "Enter the custom model ID:",
        placeholder: "...",
        validate: (value) => {
          if (!value || value.trim() === "") {
            return "A model ID is required."
          }
          return undefined
        },
      })

      if (p.isCancel(customModelResult)) {
        p.outro(color.red("Operation cancelled."))
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

    const configDetails = `Provider ${color.gray("→")}  ${color.cyan(aiProviders.find((ai) => provider === ai.value)?.name || provider)}
Model    ${color.gray("→")}  ${color.cyan(model)}
API Key  ${color.gray("→")}  ${color.cyan(`****${apiKey.slice(-4)}`)}
Storage  ${color.gray("→")}  ${color.cyan(configPath)}`

    p.log.message(configDetails)

    const commandsGuide = `
 ${color.cyan("$")} pai commit ${color.gray("→")}  ${color.cyan("Stage changes, generate a message, and push")}
 ${color.cyan("$")} pai config ${color.gray("→")}  ${color.cyan("Configure AI providers and API keys")}
 ${color.cyan("$")} pai reset  ${color.gray("→")}  ${color.cyan("Delete the local config.json file")}
 ${color.cyan("$")} pai list   ${color.gray("→")}  ${color.cyan("List available AI providers and their models")}`

    p.outro(
      [
        `${color.green("Configuration complete. You're ready to go!")}`,
        "",
        `${color.bold("Here are a few commands to try:")}`,
        `${commandsGuide}`,
      ].join("\n")
    )
  } catch (error: any) {
    if (error.name === "ExitPromptError") {
      console.log(color.dim("Operation cancelled."))
      return
    }
    throw error
  }
}

export async function runConfigEdit() {
  renderIntro({
    badge: "PushAI Config",
    title: "Editing local configuration",
  })

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
    p.outro(
      color.green(
        `✓ Configuration file edited. Use \`pai config --peek\` to see new values.`
      )
    )
  } catch (error: any) {
    p.outro(color.red(`Failed to open editor: ${error.message}`))
  }
}

export async function runConfigSet(options: {
  provider?: string
  model?: string
  key?: string
}) {
  renderIntro({
    badge: "PushAI Config",
    title: "Updating configuration values",
  })

  try {
    const current = await getStoredConfig()
    const updates: Partial<Config> = {}

    if (options.provider) {
      const validProviders = aiProviders.map((p) => p.value)
      if (!validProviders.includes(options.provider as ProviderType)) {
        p.outro(
          color.red(
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
      p.outro(
        color.yellow("No values provided. Use --provider, --model, or --key")
      )
      return
    }

    await setStoredConfig({ ...current, ...updates })

    const newConfig = await getStoredConfig()
    const configPath = getConfigPath()

    const providerName =
      aiProviders.find((p) => p.value === newConfig.provider)?.name ||
      newConfig.provider ||
      "(not set)"
    const modelDisplay = newConfig.model || "(not set)"
    const apiKeyDisplay = newConfig.apiKey
      ? `****${newConfig.apiKey.slice(-4)}`
      : "(not set)"

    const configDetails = `Provider ${color.gray("→")}  ${color.cyan(providerName)}
Model    ${color.gray("→")}  ${color.cyan(modelDisplay)}
API Key  ${color.gray("→")}  ${color.cyan(apiKeyDisplay)}
Storage  ${color.gray("→")}  ${color.cyan(configPath)}`

    p.log.message(configDetails)
    p.outro(color.green("Ready to use PushAI"))
  } catch (error: any) {
    if (error.name !== "ExitPromptError") {
      p.outro(color.red(`Failed to update config: ${error.message}`))
    }
  }
}

export async function runConfigPeek() {
  renderIntro({
    badge: "PushAI Config",
    title: "Viewing current configuration",
  })

  try {
    const config = await getStoredConfig()
    const configPath = getConfigPath()

    const providerName =
      aiProviders.find((p) => p.value === config.provider)?.name ||
      config.provider ||
      "(not set)"
    const modelDisplay = config.model || "(not set)"
    const apiKeyDisplay = config.apiKey
      ? `****${config.apiKey.slice(-4)}`
      : "(not set)"

    const configDetails = `Provider ${color.gray("→")}  ${color.cyan(providerName)}
Model    ${color.gray("→")}  ${color.cyan(modelDisplay)}
API Key  ${color.gray("→")}  ${color.cyan(apiKeyDisplay)}
Storage  ${color.gray("→")}  ${color.cyan(configPath)}`

    p.log.message(configDetails)
    p.outro(color.green("Use `pai config --help` to see how to update."))
  } catch (error: any) {
    if (error.name !== "ExitPromptError") {
      p.outro(color.red(`Failed to peek config: ${error.message}`))
    }
  }
}
