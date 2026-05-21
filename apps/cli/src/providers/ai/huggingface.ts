import { InferenceClient } from "@huggingface/inference"
import { BaseProvider } from "../base"
import { SYSTEM_COMMIT_PROMPT, USER_COMMIT_PROMPT } from "../../lib/prompt"
import { cleanCommitMessage, getReadableError } from "../../lib/utils"

export class HuggingFaceProvider extends BaseProvider {
  async generateCommitMessage(
    diff: string,
    options?: { regenerate?: boolean }
  ): Promise<string> {
    try {
      const regenerate = options?.regenerate || false
      const userContent = USER_COMMIT_PROMPT(diff, regenerate)

      const hf = new InferenceClient(this.apiKey, {
        endpointUrl: "https://router.huggingface.co/v1",
      })

      const response = await hf.chatCompletion({
        model: this.model,
        messages: [
          { role: "system", content: SYSTEM_COMMIT_PROMPT },
          { role: "user", content: userContent },
        ],
        max_tokens: 100,
        temperature: regenerate ? 0.8 : 0.2,
      })

      const content = response.choices[0]?.message.content || ""
      let cleaned = cleanCommitMessage(content)
      cleaned = cleaned.replace(/^commit:\s*/i, "")
      return cleaned
    } catch (error: any) {
      throw new Error(getReadableError(error))
    }
  }
}
