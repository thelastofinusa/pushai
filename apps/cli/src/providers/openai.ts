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
    signal?: AbortSignal,
    options?: { regenerate?: boolean }
  ): Promise<string> {
    const regenerate = options?.regenerate || false
    const openai = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseUrl || undefined,
    })

    const response = await openai.chat.completions.create(
      {
        model: this.model,
        messages: [
          { role: "user", content: GENERATE_COMMIT_PROMPT(diff, regenerate) },
        ],
        temperature: regenerate ? 0.8 : 0.7,
        max_tokens: 100,
      },
      { signal }
    )

    return (
      response.choices[0]?.message.content?.trim().replace(/['"]/g, "") || ""
    )
  }
}
