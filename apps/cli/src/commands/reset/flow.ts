import color from "chalk"
import * as p from "@clack/prompts"

import { renderIntro } from "../../lib/utils"
import { resetApiKeyOnly, resetStoredConfig } from "../../lib/storage"

export async function runReset(
  skipConfirm: boolean = false,
  key: boolean = false
) {
  renderIntro({
    badge: "PushAI Reset",
    title: "Clear saved configuration",
    badgeBgColor: "bgRed",
    iconColor: "red",
  })

  if (key) {
    const deleted = await resetApiKeyOnly()
    if (deleted) p.outro(color.green("API key removed from keychain."))
    else p.outro(color.dim("No API key found."))
    return
  }

  try {
    let shouldDelete = false

    if (skipConfirm) {
      shouldDelete = true
    } else {
      const shouldDeleteResult = await p.confirm({
        message: color.red("Remove all saved providers, models, and API keys?"),
        initialValue: false,
      })
      if (p.isCancel(shouldDeleteResult))
        return p.outro(color.dim("Reset cancelled. No changes were made."))

      shouldDelete = shouldDeleteResult
    }

    if (!shouldDelete) return p.outro(color.dim("Configuration reset skipped."))

    const deleted = await resetStoredConfig()

    if (deleted) {
      p.outro(color.green("PushAI configuration and credentials cleared."))
    } else {
      p.outro(color.dim("No saved configuration was found."))
    }
  } catch (error: any) {
    return p.outro(color.red(error.message))
  }
}
