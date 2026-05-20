import color from "chalk"
import * as p from "@clack/prompts"

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

type IntroOptions = {
  title: string
  badge?: string
  icon?: string
}

export function renderIntro({
  title,
  badge = "PushAI",
  icon = "●",
}: IntroOptions) {
  p.intro(
    `${color.cyan(icon)} ${color.bgCyan.black.bold(` ${badge} `)} ${color.dim("→")} ${color.white(title)}`
  )
}
