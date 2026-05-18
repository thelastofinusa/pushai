import { InferenceClient } from "@huggingface/inference"
import { BaseProvider } from "../base"
import {
  SYSTEM_COMMIT_PROMPT,
  USER_COMMIT_PROMPT,
} from "../../constants/prompt"

export class HuggingFaceProvider extends BaseProvider {
  async generateCommitMessage(
    diff: string,
    signal?: AbortSignal,
    options?: { regenerate?: boolean }
  ): Promise<string> {
    const regenerate = options?.regenerate || false
    const userContent = USER_COMMIT_PROMPT(diff, regenerate)

    // Try chatCompletion with system message
    try {
      const hf = new InferenceClient(this.apiKey, {
        endpointUrl: "https://router.huggingface.co/v1",
      })
      const response = await hf.chatCompletion(
        {
          model: this.model,
          messages: [
            { role: "system", content: SYSTEM_COMMIT_PROMPT },
            { role: "user", content: userContent },
          ],
          max_tokens: 100,
          temperature: regenerate ? 0.8 : 0.2,
        },
        { signal }
      )
      const content = response.choices[0]?.message.content || ""
      return content
        .trim()
        .replace(/['"]/g, "")
        .replace(/^commit:\s*/i, "")
    } catch (chatError: any) {
      // Fallback to textGeneration: prepend system prompt to user input
      try {
        const hf = new InferenceClient(this.apiKey)
        const fullPrompt = `${SYSTEM_COMMIT_PROMPT}\n\nUser:\n${userContent}\n\nAssistant (commit message only):`
        const response = await hf.textGeneration(
          {
            model: this.model,
            inputs: fullPrompt,
            parameters: {
              max_new_tokens: 100,
              temperature: regenerate ? 0.8 : 0.2,
              return_full_text: false,
            },
          },
          { signal }
        )
        return response.generated_text
          .trim()
          .replace(/['"]/g, "")
          .replace(/^commit:\s*/i, "")
      } catch (error: any) {
        throw error instanceof Error
          ? error
          : new Error("Hugging Face API error")
      }
    }
  }
}
