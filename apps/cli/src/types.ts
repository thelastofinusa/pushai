export type ProviderType = "gemini" | "openai" | "huggingface" | "custom"

export interface Config {
  provider: ProviderType
  apiKey: string
  model: string
  baseUrl?: string // For local AI/Ollama
}

export interface AIProvider {
  generateCommitMessage(diff: string, signal?: AbortSignal): Promise<string>
}
