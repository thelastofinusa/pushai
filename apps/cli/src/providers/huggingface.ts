import { InferenceClient } from "@huggingface/inference"
import { BaseProvider } from "./base"
import { GENERATE_COMMIT_PROMPT } from "../utils/prompt"

export class HuggingFaceProvider extends BaseProvider {
  async generateCommitMessage(
    diff: string,
    signal?: AbortSignal,
    options?: { regenerate?: boolean }
  ): Promise<string> {
    const regenerate = options?.regenerate || false

    // First, try chatCompletion (works for conversational models like Llama-3)
    try {
      const hf = new InferenceClient(this.apiKey, {
        endpointUrl: "https://router.huggingface.co/v1",
      })
      const response = await hf.chatCompletion(
        {
          model: this.model,
          messages: [
            { role: "user", content: GENERATE_COMMIT_PROMPT(diff, regenerate) },
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
      // If chatCompletion fails (e.g., model not supported), fall back to textGeneration
      try {
        const hf = new InferenceClient(this.apiKey)
        const response = await hf.textGeneration(
          {
            model: this.model,
            inputs: GENERATE_COMMIT_PROMPT(diff, regenerate),
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
