import { GoogleGenAI } from "@google/genai"

import { BaseProvider } from "./base"
import { GENERATE_COMMIT_PROMPT } from "../constants/prompt"

export class GeminiProvider extends BaseProvider {
  private ai: GoogleGenAI

  constructor(apiKey: string, model: string) {
    super(apiKey, model)

    this.ai = new GoogleGenAI({ apiKey })
  }

  async generateCommitMessage(
    diff: string,
    _signal?: AbortSignal,
    options?: { regenerate?: boolean }
  ): Promise<string> {
    const regenerate = options?.regenerate || false

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: GENERATE_COMMIT_PROMPT(diff, regenerate),
        config: {
          temperature: regenerate ? 0.8 : 0.2,
          maxOutputTokens: 100,
        },
      })

      const text = response.text?.trim() || ""

      const isValid =
        /^[a-z]+(\([a-z0-9-]+\))?: .+/.test(text) && text.length <= 200

      if (!isValid) {
        throw new Error("Invalid commit message generated")
      }

      return text
    } catch (error: any) {
      throw error instanceof Error ? error : new Error("Gemini API error")
    }
  }
}
