import Anthropic, {
  APIConnectionError,
  APIError,
  AuthenticationError,
  RateLimitError,
} from "@anthropic-ai/sdk"
import { BaseProvider } from "../base"
import {
  SYSTEM_COMMIT_PROMPT,
  USER_COMMIT_PROMPT,
} from "../../constants/prompt"

export class AnthropicProvider extends BaseProvider {
  private client: Anthropic

  constructor(apiKey: string, model: string) {
    super(apiKey, model)
    this.client = new Anthropic({ apiKey })
  }

  async generateCommitMessage(
    diff: string,
    options?: { regenerate?: boolean }
  ): Promise<string> {
    const regenerate = options?.regenerate || false
    const userPrompt = USER_COMMIT_PROMPT(diff, regenerate)

    try {
      const response = await this.client.messages.create({
        model: this.model,
        system: SYSTEM_COMMIT_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
        max_tokens: 100,
        temperature: regenerate ? 0.8 : 0.2,
      })

      const text =
        response.content[0]?.type === "text" ? response.content[0].text : ""
      const cleaned = text.trim().replace(/['"]/g, "")

      const isValid = /^[a-z]+(\([a-z0-9-]+\))?: .+/.test(cleaned)
      if (!isValid) throw new Error("Invalid commit message generated")

      return cleaned
    } catch (error: any) {
      if (error instanceof AuthenticationError) {
        throw new Error(`Anthropic authentication failed: ${error.message}`)
      } else if (error instanceof RateLimitError) {
        throw new Error(`Anthropic rate limit: ${error.message}`)
      } else if (error instanceof APIConnectionError) {
        throw new Error(`Anthropic connection error: ${error.message}`)
      } else if (error instanceof APIError) {
        throw new Error(`Anthropic error (${error.status}): ${error.message}`)
      }
      throw error
    }
  }
}
