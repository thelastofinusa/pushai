import OpenAI from "openai"
import { BaseProvider } from "../base"
import { SYSTEM_COMMIT_PROMPT, USER_COMMIT_PROMPT } from "../../lib/prompt"
import { cleanCommitMessage, getReadableError } from "../../lib/utils"

export class OpenAIProvider extends BaseProvider {
  async generateCommitMessage(
    diff: string,
    options?: { regenerate?: boolean }
  ): Promise<string> {
    const regenerate = options?.regenerate || false
    const openai = new OpenAI({ apiKey: this.apiKey })

    try {
      const response = await openai.chat.completions.create({
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
