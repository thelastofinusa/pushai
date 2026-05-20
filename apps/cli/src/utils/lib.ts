import chalk from "chalk"
import { spinner as loader } from "@clack/prompts"

export type ChalkColor = keyof Pick<
  typeof chalk,
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "cyan"
  | "magenta"
  | "gray"
  | "white"
  | "cyanBright"
>

// in lib.ts
export function createSpinner(
  colorOrGetter: ChalkColor | (() => ChalkColor) = "cyan"
) {
  return loader({
    frames: ["⬒", "⬔", "⬓", "⬕"],
    styleFrame: (frame) => {
      const color =
        typeof colorOrGetter === "function" ? colorOrGetter() : colorOrGetter
      const fn = chalk[color] as (text: string) => string
      return fn(frame)
    },
  })
}

// Helper to add slow message updates for clack spinner
export function createSlowSpinner(
  s: ReturnType<typeof loader>,
  slow10: string,
  slow60: string
) {
  let active = true
  const timeout10 = setTimeout(() => {
    if (active) {
      s.message(chalk.yellow(slow10))
    }
  }, 10000)

  const timeout60 = setTimeout(() => {
    if (active) {
      s.message(chalk.red(slow60))
    }
  }, 60000)

  return () => {
    active = false
    clearTimeout(timeout10)
    clearTimeout(timeout60)
    // reset message to original? Not necessary – next start will overwrite
  }
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))
