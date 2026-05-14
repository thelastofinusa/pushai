import { Config, AIProvider } from "../types"
import { GeminiProvider } from "./gemini"
import { HuggingFaceProvider } from "./huggingface"
import { OpenAIProvider } from "./openai"

export const aiProviders = [
  {
    name: "Gemini (Google)",
    value: "gemini",
    models: [
      { name: "Gemini 1.5 Flash (Recommended)", value: "gemini-1.5-flash" },
      { name: "Gemini 1.5 Pro", value: "gemini-1.5-pro" },
    ],
  },
  {
    name: "OpenAI (GPT-4)",
    value: "openai",
    models: [
      { name: "GPT-4o (Recommended)", value: "gpt-4o" },
      { name: "GPT-4o mini", value: "gpt-4o-mini" },
      { name: "GPT-4 Turbo", value: "gpt-4-turbo" },
    ],
  },
  {
    name: "HuggingFace (Open Source)",
    value: "huggingface",
    models: [
      {
        name: "Llama 3 8B Instruct (Recommended)",
        value: "meta-llama/Meta-Llama-3-8B-Instruct",
      },
      { name: "Mistral 7B v0.3", value: "mistralai/Mistral-7B-Instruct-v0.3" },
      { name: "Qwen 2 7B", value: "Qwen/Qwen2-7B-Instruct" },
    ],
  },
  {
    name: "Custom (Ollama/Local)",
    value: "custom",
    models: [
      { name: "Llama 3 (Ollama Default)", value: "llama3" },
      { name: "Mistral", value: "mistral" },
      { name: "Phi-3", value: "phi3" },
    ],
  },
]

export function getAIProvider(config: Config): AIProvider {
  switch (config.provider) {
    case "gemini":
      return new GeminiProvider(config.apiKey, config.model)
    case "huggingface":
      return new HuggingFaceProvider(config.apiKey, config.model)
    case "openai":
    case "custom":
      return new OpenAIProvider(config.apiKey, config.model, config.baseUrl)
    default:
      throw new Error(`Provider ${config.provider} is not supported.`)
  }
}
