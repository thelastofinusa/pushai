import color from "chalk"
import * as p from "@clack/prompts"

import { renderIntro } from "../../lib/utils"
import { aiProviders } from "../../providers/models"

export async function runList() {
  renderIntro({
    badge: "PushAI Explorer",
    title: "Browse available providers & models",
    badgeBgColor: "bgMagenta",
    iconColor: "magenta",
  })

  for (const provider of aiProviders) {
    const models =
      provider.models
        ?.map((model) => {
          const hintText = model.hint ? color.dim(` — ${model.hint}`) : ""
          return `  ${color.cyan("→")} ${color.white(model.value)}${hintText}`
        })
        .join("\n") || color.dim("  No models available")

    p.log.message(
      [
        `${color.cyan.bold(provider.name)} ${color.dim("→")} ${color.dim(provider.value)}`,
        "",
        models,
      ].join("\n")
    )
  }

  p.outro(
    color.green(
      `Use ${color.bold("pai config -p <provider> -m <model>")} to configure.`
    )
  )
}
