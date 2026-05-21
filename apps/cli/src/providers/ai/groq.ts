import OpenAI from "openai"
import { BaseProvider } from "../base"
import { SYSTEM_COMMIT_PROMPT, USER_COMMIT_PROMPT } from "../../lib/prompt"
import { cleanCommitMessage, getReadableError } from "../../lib/utils"

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
    options?: { regenerate?: boolean }
  ): Promise<string> {
    const regenerate = options?.regenerate || false

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: SYSTEM_COMMIT_PROMPT },
          { role: "user", content: USER_COMMIT_PROMPT(diff, regenerate) },
        ],
        temperature: regenerate ? 0.8 : 0.2,
        max_tokens: 100,
      })

      const content = response.choices[0]?.message.content || ""
      return cleanCommitMessage(content)
    } catch (error: any) {
      throw new Error(getReadableError(error))
    }
  }
}
