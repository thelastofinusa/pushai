import * as p from "@clack/prompts"
import chalk, { ForegroundColorName } from "chalk"

type Threshold = {
  afterMs: number
  message: string
  color?: ForegroundColorName
}

type Options<T> = {
  fn: () => Promise<T>
  initialMessage: string
  initialColor?: ForegroundColorName
  thresholds?: Threshold[]
  successMessage?: string | ((result: T) => string)
  errorMessage?: string | ((error: any) => string)
  abortMessage?: string
}

export function createSpinner(
  colorOrGetter: ForegroundColorName | (() => ForegroundColorName) = "cyan"
) {
  return p.spinner({
    frames: ["⬒", "⬔", "⬓", "⬕"],
    styleFrame: (frame) => {
      const color =
        typeof colorOrGetter === "function" ? colorOrGetter() : colorOrGetter
      const fn = chalk[color] as (text: string) => string
      return fn(frame)
    },
  })
}

export async function withTimedSpinner<T>({
  fn,
  initialMessage,
  initialColor = "cyan",
  thresholds = [],
  successMessage = "Done.",
  errorMessage = "Failed.",
  abortMessage = "Cancelled.",
}: Options<T>): Promise<T> {
  let currentColor: ForegroundColorName = initialColor

  const spinner = createSpinner(() => currentColor)
  spinner.start(initialMessage)

  const timers: NodeJS.Timeout[] = []
  for (const { afterMs, message, color } of thresholds) {
    const timer = setTimeout(() => {
      if (color) currentColor = color
      spinner.message(message)
    }, afterMs)
    timers.push(timer)
  }

  try {
    const result = await fn()
    timers.forEach(clearTimeout)
    spinner.stop(
      typeof successMessage === "function"
        ? successMessage(result)
        : successMessage
    )
    return result
  } catch (error: any) {
    timers.forEach(clearTimeout)
    if (error.name === "AbortError") {
      spinner.stop(abortMessage)
      throw error
    }
    spinner.stop(
      typeof errorMessage === "function" ? errorMessage(error) : errorMessage
    )
    throw error
  }
}
