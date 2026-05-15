import { BaseProvider } from "./base"
import { GENERATE_COMMIT_PROMPT } from "../utils/prompt"

export class GeminiProvider extends BaseProvider {
  async generateCommitMessage(
    diff: string,
    signal?: AbortSignal
  ): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`

    const payload = {
      contents: [
        {
          parts: [{ text: GENERATE_COMMIT_PROMPT(diff) }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
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
      throw new Error(`Gemini API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    return text.trim().replace(/['"]/g, "")
  }
}
