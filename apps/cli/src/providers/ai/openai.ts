import OpenAI from "openai"
import { BaseProvider } from "../base"
import {
  SYSTEM_COMMIT_PROMPT,
  USER_COMMIT_PROMPT,
} from "../../constants/prompt"

export class OpenAIProvider extends BaseProvider {
  async generateCommitMessage(
    diff: string,
    signal?: AbortSignal,
    options?: { regenerate?: boolean }
  ): Promise<string> {
    const regenerate = options?.regenerate || false
    const openai = new OpenAI({ apiKey: this.apiKey })

    try {
      const response = await openai.chat.completions.create(
        {
          model: this.model,
          messages: [
            { role: "system", content: SYSTEM_COMMIT_PROMPT },
            { role: "user", content: USER_COMMIT_PROMPT(diff, regenerate) },
          ],
          temperature: regenerate ? 0.8 : 0.7,
          max_tokens: 100,
        },
        { signal }
      )

      return (
        response.choices[0]?.message.content?.trim().replace(/['"]/g, "") || ""
      )
    } catch (error: any) {
      throw error instanceof Error ? error : new Error("OpenAI API error")
    }
  }
}
