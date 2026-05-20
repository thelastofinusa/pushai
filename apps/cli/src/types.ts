export type ProviderType =
  | "gemini"
  | "openai"
  | "huggingface"
  | "anthropic"
  | "groq"

export interface Config {
  provider: ProviderType
  apiKey: string
  model: string
}

export interface AIProvider {
  generateCommitMessage(
    diff: string,
    options?: { regenerate?: boolean }
  ): Promise<string>
}
