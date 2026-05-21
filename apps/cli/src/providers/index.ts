import { AIProvider, Config } from "../types"
import { AnthropicProvider } from "./ai/anthropic"
import { GeminiProvider } from "./ai/gemini"
import { GroqProvider } from "./ai/groq"
import { HuggingFaceProvider } from "./ai/huggingface"
import { OpenAIProvider } from "./ai/openai"

export function getAIProvider(config: Config): Promise<AIProvider> {
  switch (config.provider) {
    case "gemini":
      return Promise.resolve(new GeminiProvider(config.apiKey, config.model))
    case "huggingface":
      return Promise.resolve(
        new HuggingFaceProvider(config.apiKey, config.model)
      )
    case "openai":
      return Promise.resolve(new OpenAIProvider(config.apiKey, config.model))
    case "anthropic":
      return Promise.resolve(new AnthropicProvider(config.apiKey, config.model))
    case "groq":
      return Promise.resolve(new GroqProvider(config.apiKey, config.model))
    default:
      throw new Error(`Provider ${config.provider} is not supported.`)
  }
}
