import { InferenceClient } from "@huggingface/inference"
import { BaseProvider } from "./base"
import { GENERATE_COMMIT_PROMPT } from "../utils/prompt"

export class HuggingFaceProvider extends BaseProvider {
  async generateCommitMessage(diff: string): Promise<string> {
    // We pass the new Router URL to ensure compatibility with modern model endpoints
    const hf = new InferenceClient(this.apiKey, {
      // baseUrl: "https://router.huggingface.co/v1",
      endpointUrl: "https://router.huggingface.co/v1",
    })

    try {
      const response = await hf.chatCompletion({
        model: this.model,
        messages: [
          {
            role: "user",
            content: GENERATE_COMMIT_PROMPT(diff),
          },
        ],
        max_tokens: 100,
        temperature: 0.2, // Lower temperature is better for structured commit messages
      })

      const content = response.choices[0]?.message.content || ""

      return content
        .trim()
        .replace(/['"]/g, "") // Remove surrounding quotes
        .replace(/^commit:\s*/i, "") // Remove common AI prefix "Commit: "
    } catch (error: any) {
      // Improved error logging to help you debug trace_ids
      throw new Error(`Hugging Face Error: ${error.message}`)
    }
  }
}
