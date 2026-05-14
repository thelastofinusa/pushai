import { GoogleGenerativeAI } from "@google/generative-ai"
import { BaseProvider } from "./base"
import { GENERATE_COMMIT_PROMPT } from "../utils/prompt"

export class GeminiProvider extends BaseProvider {
  async generateCommitMessage(diff: string): Promise<string> {
    const genAI = new GoogleGenerativeAI(this.apiKey)
    const model = genAI.getGenerativeModel({ model: this.model })

    const result = await model.generateContent(GENERATE_COMMIT_PROMPT(diff))
    return result.response.text().trim().replace(/['"]/g, "")
  }
}
