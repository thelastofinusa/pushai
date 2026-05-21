import color from "chalk"
import * as p from "@clack/prompts"
import { spawn } from "child_process"
import { Config, ProviderType } from "../../types"
import {
  getConfigPath,
  getStoredConfig,
  setStoredConfig,
} from "../../lib/storage"
import { aiProviders } from "../../providers/models"
import { renderIntro } from "../../lib/utils"

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                    */
/* ------------------------------------------------------------------ */

/** Pretty-prints the current config + a short outro. */
function displayConfig(config: Config) {
  const configPath = getConfigPath()
  const providerName =
    aiProviders.find((p) => p.value === config.provider)?.name ||
    config.provider ||
    "(not set)"
  const modelDisplay = config.model || "(not set)"
  const apiKeyDisplay = config.apiKey
    ? `****${config.apiKey.slice(-4)}`
    : "(not set)"

  const details = `Provider ${color.gray("→")}  ${color.cyan(providerName)}
Model    ${color.gray("→")}  ${color.cyan(modelDisplay)}
API Key  ${color.gray("→")}  ${color.cyan(apiKeyDisplay)}
Storage  ${color.gray("→")}  ${color.cyan(configPath)}`

  p.log.message(details)
}

/* ------------------------------------------------------------------ */
/*  Smart config (only prompts for missing fields)                    */
/* ------------------------------------------------------------------ */

export async function runConfigSmart(currentConfig: Partial<Config>) {
  let { provider, model, apiKey } = currentConfig

  // Step 1: Provider (if missing)
  if (!provider) {
    const providerResult = await p.select({
      message: "Choose from the available AI providers:",
      options: aiProviders.map((p) => ({
        label: p.name,
        value: p.value,
      })),
    })
    if (p.isCancel(providerResult)) {
      p.outro(color.red("Provider selection cancelled. No changes applied."))
      process.exit(0)
    }
    provider = providerResult as ProviderType
  }

  // Step 2: API key (if missing)
  if (!apiKey) {
    const apiKeyResult = await p.password({
      message: `Enter your ${color.cyan.bold(provider!)} API key:`,
      validate: (value) => {
        if (!value || value.trim() === "") return "API key is required."
        return undefined
      },
    })
    if (p.isCancel(apiKeyResult)) {
      p.outro(color.red("API key setup cancelled. No changes applied."))
      process.exit(0)
    }
    apiKey = apiKeyResult as string
  }

  // Step 3: Model (if missing)
  if (!model) {
    const selectedProvider = aiProviders.find((p) => p.value === provider)
    const modelResult = await p.select({
      message: "Which model would you like to use?",
      options: [
        ...(selectedProvider?.models?.map((m) => ({
          label: m.name,
          value: m.value,
          hint: m.hint,
        })) || []),
        { label: "Use a custom model ID", value: "custom_id" },
      ],
    })
    if (p.isCancel(modelResult)) {
      p.outro(color.red("Model selection cancelled. No changes applied."))
      process.exit(0)
    }
    let selectedModel = modelResult as string
    if (selectedModel === "custom_id") {
      const customModelResult = await p.text({
        message: "Enter the custom model ID:",
        placeholder: "...",
        validate: (value) => {
          if (!value || value.trim() === "") return "A model ID is required."
          return undefined
        },
      })
      if (p.isCancel(customModelResult)) {
        p.outro(color.red("Custom model entry cancelled."))
        process.exit(0)
      }
      selectedModel = customModelResult as string
    }
    model = selectedModel
  }

  // Save the complete config
  await setStoredConfig({ provider, apiKey, model })
  const newConfig = await getStoredConfig()
  displayConfig(newConfig as Config)

  return newConfig as Config
}

/* ------------------------------------------------------------------ */
/*  Wizard (interactive setup)                                        */
/* ------------------------------------------------------------------ */

export async function runConfigWizard(showIntro: boolean = true) {
  if (showIntro) {
    renderIntro({
      badge: "PushAI Config",
      title: "Set up your AI provider and model",
      badgeBgColor: "bgBlue",
      iconColor: "blue",
    })
  }

  // --- Provider selection ---
  const providerResult = await p.select({
    message: "Choose from the available AI providers:",
    options: aiProviders.map((p) => ({
      label: p.name,
      value: p.value,
    })),
  })
  if (p.isCancel(providerResult)) {
    p.outro(
      color.red("Provider selection cancelled. No configuration was saved.")
    )
    process.exit(0)
  }
  const provider = providerResult as ProviderType
  const selectedProvider = aiProviders.find((p) => p.value === provider)

  // --- API key ---
  const apiKeyResult = await p.password({
    message: `Enter your ${color.cyan.bold(provider)} API key:`,
    validate: (value) => {
      if (!value || value.trim() === "")
        return "You'll need an API key to continue."
      return undefined
    },
  })
  if (p.isCancel(apiKeyResult)) {
    p.outro(
      color.red("API key setup cancelled. Configuration was not completed.")
    )
    process.exit(0)
  }
  const apiKey = apiKeyResult as string

  // --- Model selection ---
  const modelResult = await p.select({
    message: "Which model would you like to use?",
    options: [
      ...(selectedProvider?.models?.map((m) => ({
        label: m.name,
        value: m.value,
        hint: m.hint,
      })) || []),
      { label: "Use a custom model ID", value: "custom_id" },
    ],
  })
  if (p.isCancel(modelResult)) {
    p.outro(color.red("Model selection cancelled. No changes were applied."))
    process.exit(0)
  }
  let model = modelResult as string

  if (model === "custom_id") {
    const customModelResult = await p.text({
      message: "Enter the custom model ID:",
      placeholder: "...",
      validate: (value) => {
        if (!value || value.trim() === "") return "A model ID is required."
        return undefined
      },
    })
    if (p.isCancel(customModelResult)) {
      p.outro(color.red("Custom model entry cancelled."))
      process.exit(0)
    }
    model = customModelResult as string
  }

  // Save config
  await setStoredConfig({ provider, apiKey, model })
  const config = await getStoredConfig()
  displayConfig(config as Config)

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
}

/* ------------------------------------------------------------------ */
/*  Quick set (--provider, --model, --key)                            */
/* ------------------------------------------------------------------ */

export async function runConfigSet(options: {
  provider?: string
  model?: string
  key?: string
}) {
  renderIntro({
    badge: "PushAI Config",
    title: "Updated configuration values",
    badgeBgColor: "bgGreen",
    iconColor: "green",
  })

  const current = await getStoredConfig()
  const updates: Partial<Config> = {}

  if (options.provider) {
    const validProviders = aiProviders.map((p) => p.value)
    if (!validProviders.includes(options.provider as ProviderType)) {
      p.outro(
        color.red(`Invalid provider. Use one of: ${validProviders.join(", ")}`)
      )
      process.exit(1)
    }
    updates.provider = options.provider as ProviderType
  }

  if (options.model) updates.model = options.model
  if (options.key) updates.apiKey = options.key

  if (Object.keys(updates).length === 0) {
    p.outro(
      color.yellow("No values provided. Use --provider, --model, or --key")
    )
    process.exit(0)
  }

  await setStoredConfig({ ...current, ...updates })

  const newConfig = await getStoredConfig()
  displayConfig(newConfig as Config)
  p.outro(color.green("Ready to use PushAI"))
}

/* ------------------------------------------------------------------ */
/*  Edit config (open in $EDITOR)                                     */
/* ------------------------------------------------------------------ */

export async function runConfigEdit() {
  renderIntro({
    badge: "PushAI Config",
    title: "Editing local configuration",
    badgeBgColor: "bgYellow",
    iconColor: "yellow",
  })

  const configPath = getConfigPath()
  const editor = process.env.EDITOR || process.env.VISUAL

  if (!editor) {
    p.log.error(
      color.red("No editor found. Set $EDITOR or $VISUAL environment variable.")
    )
    p.outro(
      color.yellow("Alternatively, edit the file manually at: " + configPath)
    )
    process.exit(1)
  }

  try {
    await new Promise<void>((resolve, reject) => {
      const child = spawn(editor, [configPath], { stdio: "inherit" })
      child.on("close", (code) =>
        code === 0
          ? resolve()
          : reject(new Error(`Editor exited with code ${code}`))
      )
      child.on("error", reject)
    })
    p.outro(
      color.green(
        "Configuration saved. Use `pai config --show` to see changes."
      )
    )
  } catch (err: any) {
    p.outro(color.red(`Failed to open editor: ${err.message}`))
    process.exit(1)
  }
}

/* ------------------------------------------------------------------ */
/*  Show current config                                               */
/* ------------------------------------------------------------------ */

export async function runConfigShow() {
  renderIntro({
    badge: "PushAI Config",
    title: "Viewing current configuration",
    badgeBgColor: "bgCyan",
    iconColor: "cyan",
  })

  const config = await getStoredConfig()
  displayConfig(config as Config)
  p.outro(
    color.green(`Use ${color.bold(`pai config --help`)} to see how to update.`)
  )
}
