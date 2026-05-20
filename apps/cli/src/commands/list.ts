import color from "chalk"
import * as p from "@clack/prompts"
import { aiProviders } from "../providers/models"
import { renderIntro } from "../utils/lib"

export async function runList() {
  renderIntro({
    badge: "PushAI Config",
    title: "Browse available providers & models",
  })

  for (const provider of aiProviders) {
    const modelLines = provider.models
      .map((model) => {
        const hintText = model.hint ? `: ${model.hint}` : ""
        return `  ${color.dim(model.value)}${hintText}`
      })
      .join("\n")

    const content = modelLines || color.dim("  No models available")
    const title = color.cyan(`${provider.name} models`)
    p.note(content, title)
  }

  p.outro("Use `pai config -p <name> -m <model_id>` to configure.")
}
