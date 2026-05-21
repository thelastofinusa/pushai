import { GoogleGenAI } from "@google/genai"
import { BaseProvider } from "../base"
import { SYSTEM_COMMIT_PROMPT, USER_COMMIT_PROMPT } from "../../lib/prompt"
import { cleanCommitMessage, getReadableError } from "../../lib/utils"

export class GeminiProvider extends BaseProvider {
  private ai: GoogleGenAI

  constructor(apiKey: string, model: string) {
    super(apiKey, model)
    this.ai = new GoogleGenAI({ apiKey })
  }

  async generateCommitMessage(
    diff: string,
    options?: { regenerate?: boolean }
  ): Promise<string> {
    const regenerate = options?.regenerate || false

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: USER_COMMIT_PROMPT(diff, regenerate),
        config: {
          systemInstruction: SYSTEM_COMMIT_PROMPT,
          temperature: regenerate ? 0.8 : 0.2,
          maxOutputTokens: 100,
        },
      })

      const text = response.text?.trim() || ""
      const cleaned = cleanCommitMessage(text)

      const isValid = /^[a-z]+(\([a-z0-9-]+\))?: .+/.test(cleaned)
      if (!isValid) throw new Error("Invalid commit message generated")

      return cleaned
    } catch (error: any) {
      console.log(error)
      throw new Error(getReadableError(error))
    }
  }
}
