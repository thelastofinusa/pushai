import OpenAI from "openai"
import { BaseProvider } from "./base"
import { GENERATE_COMMIT_PROMPT } from "../utils/prompt"

export class OpenAIProvider extends BaseProvider {
  private baseUrl?: string

  constructor(apiKey: string, model: string, baseUrl?: string) {
    super(apiKey, model)
    this.baseUrl = baseUrl
  }

  async generateCommitMessage(
    diff: string,
    signal?: AbortSignal
  ): Promise<string> {
    const openai = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseUrl || undefined,
    })

    const response = await openai.chat.completions.create(
      {
        model: this.model,
        messages: [{ role: "user", content: GENERATE_COMMIT_PROMPT(diff) }],
        temperature: 0.7,
        max_tokens: 100,
      },
      { signal } // ← passes AbortSignal to the HTTP request
    )

    return (
      response.choices[0]?.message.content?.trim().replace(/['"]/g, "") || ""
    )
  }
}
