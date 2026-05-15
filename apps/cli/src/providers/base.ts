import { AIProvider } from "../types"

export abstract class BaseProvider implements AIProvider {
  protected apiKey: string
  protected model: string

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey
    this.model = model
  }

  abstract generateCommitMessage(
    diff: string,
    signal?: AbortSignal,
    options?: { regenerate?: boolean }
  ): Promise<string>
}
