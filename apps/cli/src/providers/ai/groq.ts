import OpenAI from "openai"
import { BaseProvider } from "../base"
import {
  SYSTEM_COMMIT_PROMPT,
  USER_COMMIT_PROMPT,
} from "../../constants/prompt"

export class GroqProvider extends BaseProvider {
  private client: OpenAI

  constructor(apiKey: string, model: string) {
    super(apiKey, model)
    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    })
  }

  async generateCommitMessage(
    diff: string,
    signal?: AbortSignal,
    options?: { regenerate?: boolean }
  ): Promise<string> {
    const regenerate = options?.regenerate || false

    try {
      const response = await this.client.chat.completions.create(
        {
          model: this.model,
          messages: [
            { role: "system", content: SYSTEM_COMMIT_PROMPT },
            { role: "user", content: USER_COMMIT_PROMPT(diff, regenerate) },
          ],
          temperature: regenerate ? 0.8 : 0.2,
          max_tokens: 100,
        },
        { signal }
      )

      return (
        response.choices[0]?.message.content?.trim().replace(/['"]/g, "") || ""
      )
    } catch (error: any) {
      throw error instanceof Error ? error : new Error("Groq API error")
    }
  }
}
