import { BaseProvider } from "./base"
import { GENERATE_COMMIT_PROMPT } from "../utils/prompt"

export class GeminiProvider extends BaseProvider {
  async generateCommitMessage(
    diff: string,
    signal?: AbortSignal,
    options?: { regenerate?: boolean }
  ): Promise<string> {
    const regenerate = options?.regenerate || false
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`

    const payload = {
      contents: [
        {
          parts: [{ text: GENERATE_COMMIT_PROMPT(diff, regenerate) }],
        },
      ],
      generationConfig: {
        temperature: regenerate ? 0.8 : 0.2,
        maxOutputTokens: 100,
      },
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `Gemini API error (${response.status})`

      try {
        const errorJson = JSON.parse(errorText)
        // Extract the meaningful error message
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message
        }
      } catch {
        // Fallback to raw text if parsing fails
        errorMessage = errorText
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    return text.trim().replace(/['"]/g, "")
  }
}
