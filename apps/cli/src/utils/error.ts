import chalk from "chalk"
import { outro } from "@clack/prompts"
import { msg } from "../constants/msg"

export function getReadableErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Something unexpected went wrong."
  }

  const message = error.message.toLowerCase()

  // Authentication
  if (
    message.includes("api key") ||
    message.includes("invalid_api_key") ||
    message.includes("authentication") ||
    message.includes("authorization") ||
    message.includes("unauthorized") ||
    message.includes("401") ||
    message.includes("403")
  ) {
    return "Authentication failed. The API key appears to be invalid."
  }

  // Rate limits / quotas
  if (
    message.includes("429") ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("resource_exhausted") ||
    message.includes("too many requests")
  ) {
    const retryMatch =
      error.message.match(/retry in ([\d.]+s?)/i) ||
      error.message.match(/retrydelay":"(\d+s)"/i)

    const retry = retryMatch?.[1]

    return retry
      ? `Rate limit exceeded. Try again in ${retry}.`
      : "Rate limit exceeded. Please try again later."
  }

  // Model issues
  if (
    message.includes("model") &&
    (message.includes("not found") ||
      message.includes("unsupported") ||
      message.includes("does not exist"))
  ) {
    return "The selected AI model is unavailable or unsupported."
  }

  // Context/token overflow
  if (
    message.includes("maximum context length") ||
    message.includes("token limit")
  ) {
    return "The git diff is too large for the selected AI model."
  }

  // Safety filters
  if (message.includes("safety") || message.includes("blocked")) {
    return "The AI provider blocked this request."
  }

  // Network errors
  if (
    message.includes("fetch failed") ||
    message.includes("network") ||
    message.includes("econnreset") ||
    message.includes("timeout")
  ) {
    return "Network error. Please check your internet connection."
  }

  return "Commit message generation cancelled."
}

export function handleError(err: any): void {
  if (err.name === "ExitPromptError") return

  const readableMessage = getReadableErrorMessage(err)

  outro(chalk.red(readableMessage))

  if (readableMessage.includes("Authentication failed")) {
    outro(chalk.yellow(msg.errors.authFix))
  }
}
