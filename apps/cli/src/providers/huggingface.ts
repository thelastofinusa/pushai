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
  }
}
