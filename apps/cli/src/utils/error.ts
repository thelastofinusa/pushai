import chalk from "chalk"
import { outro } from "@clack/prompts"

/**
 * Converts provider-specific errors into a user-friendly message.
 * Handles errors from OpenAI, Gemini, Anthropic, Hugging Face, and other APIs.
 */
export function getUserFriendlyError(error: unknown): string {
  // Not an Error instance
  if (!(error instanceof Error)) {
    return "An unexpected error occurred."
  }

  const err = error
  const name = err.name
  const message = err.message
  // Some SDKs put status in `status`, others in `statusCode` or `code`
  const status =
    (err as any).status ?? (err as any).statusCode ?? (err as any).code

  // 1. Authentication / API key issues
  if (
    name === "AuthenticationError" ||
    name === "UnauthorizedError" ||
    name === "InvalidApiKeyError" ||
    status === 401 ||
    status === 403 ||
    /api key|authentication|unauthorized|invalid.*key/i.test(message)
  ) {
    return "Authentication failed. Your API key may be invalid or missing."
  }

  // 2. Rate limiting / quota exhaustion / credit depletion
  if (
    name === "RateLimitError" ||
    name === "QuotaExceededError" ||
    status === 429 ||
    /rate limit|quota|resource exhausted|too many requests|depleted.*credit|included credits|pre-paid/i.test(
      message
    )
  ) {
    // For credit / billing errors, show the exact message from the provider
    if (/credit|depleted|pre-paid|included credits/i.test(message)) {
      return message
    }
    return "Rate limit reached. Please try again later or check your plan limits."
  }

  // 3. Model not found / unsupported / does not exist
  if (
    name === "NotFoundError" ||
    name === "ModelNotFoundError" ||
    status === 404 ||
    /model.*not found|model.*unsupported|does not exist/i.test(message)
  ) {
    return "The selected AI model is unavailable or unsupported. Please choose a different model."
  }

  // 4. Context length / token limit overflow
  if (
    name === "ContextLengthExceededError" ||
    /maximum context length|token limit|too long/i.test(message)
  ) {
    return "The git diff is too large for this model. Try splitting your changes or using a model with larger context."
  }

  // 5. Safety filters / content blocked
  if (
    name === "SafetyError" ||
    /safety|blocked|harmful content/i.test(message)
  ) {
    return "The request was blocked by the AI provider's safety filters."
  }

  // 6. Network / connection / timeout errors
  if (
    name === "APIConnectionError" ||
    name === "TimeoutError" ||
    name === "FetchError" ||
    /fetch failed|network|econnreset|timeout|connection|ECONNRESET|ENOTFOUND/i.test(
      message
    )
  ) {
    return "Network error. Please check your internet connection and try again."
  }

  // 7. Hugging Face specific – e.g., "InputError: model X is not supported for task text-generation"
  if (
    name === "HTTPError" ||
    name === "InferenceTimeoutError" ||
    (message.includes("InputError") &&
      message.includes("not supported for task"))
  ) {
    return message // Show the raw error because it's often actionable
  }

  // 8. Anthropic specific (custom types not yet identified) – fall through to default
  // 9. OpenAI specific – already covered by names above

  // Fallback: return the original error name and message
  return `${name}: ${message}`
}

export function handleError(err: any): void {
  if (err.name === "ExitPromptError") return
  const friendly = getUserFriendlyError(err)
  outro(chalk.red(friendly))
  if (friendly.includes("Authentication failed")) {
    outro(chalk.yellow("Run `pai reset` to update your credentials."))
  }
}
