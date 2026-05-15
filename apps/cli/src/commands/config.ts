import chalk from "chalk"
import { select, input, password, Separator } from "@inquirer/prompts"
import { getConfigPath, setStoredConfig } from "../utils/config"
import { aiProviders } from "../providers"
import { ProviderType } from "../types"

export async function runConfig() {
  console.log(chalk.blue.bold("\nPushAI Configuration\n"))

  try {
    const provider = (await select({
      message: "Select your AI provider:",
      choices: aiProviders.map((p) => ({ name: p.name, value: p.value })),
    })) as ProviderType

    const selectedProvider = aiProviders.find((p) => p.value === provider)

    const apiKey = await password({
      message: `Enter your ${provider} API Key:`,
      validate: (value) => (value.length === 0 ? "Key is required" : true),
    })

    // 1. Select from recommended models
    let model = await select({
      message: "Select a model:",
      choices: [
        ...(selectedProvider?.models || []),
        new Separator(),
        {
          name: "Custom model ID",
          value: "custom_id",
        },
      ],
    })

    // 2. If they chose custom, ask for the string
    if (model === "custom_id") {
      model = await input({
        message: "Enter the custom model ID:",
        validate: (value) =>
          value.length === 0 ? "Model ID is required" : true,
      })
    }

    const baseUrl = await input({
      message: "Base URL (Optional, press Enter to skip):",
      default: "",
    })

    setStoredConfig({
      provider,
      apiKey,
      model,
      baseUrl: baseUrl || undefined,
    })

    const configPath = getConfigPath()

    console.log(chalk.green("\nConfiguration saved successfully!"))
    console.log(chalk.dim("----------------------------------------"))
    // Use the variables 'provider', 'model', and 'apiKey' directly
    console.log(`${chalk.bold("Provider:")} ${provider}`)
    console.log(`${chalk.bold("Model:   ")} ${model}`)
    console.log(`${chalk.bold("API Key: ")} ****${apiKey.slice(-4)}`)
    console.log(chalk.dim("----------------------------------------"))
    console.log(chalk.dim(`File: ${configPath}\n`))

    // --- Added Commands Guide ---
    console.log(chalk.cyan("Try running these commands:"))
    console.log(
      `  ${chalk.white.bold("pai commit")} ${chalk.white("→ Just the AI generation")}`
    )
    console.log(
      `  ${chalk.white.bold("pai config")} ${chalk.white("→ Change model or keys")}`
    )
    console.log(
      `  ${chalk.white.bold("pai reset")}  ${chalk.white("→ Wipe all local settings")}\n`
    )
  } catch (error: any) {
    if (error.name === "ExitPromptError") {
      console.log(chalk.dim("\nSetup cancelled.\n"))
      return // Exit the function without crashing
    }
    throw error
  }
}
