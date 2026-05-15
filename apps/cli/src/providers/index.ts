import { Config, AIProvider } from "../types"
import { GeminiProvider } from "./gemini"
import { HuggingFaceProvider } from "./huggingface"
import { OpenAIProvider } from "./openai"

export const aiProviders = [
  {
    name: "Google Gemini",
    value: "gemini",
    models: [
      {
        name: "Gemini 3.1 Flash Lite",
        value: "gemini-3.1-flash-lite",
        hint: "free • recommended",
      },
      {
        name: "Gemini Flash Lite Latest",
        value: "gemini-flash-lite-latest",
        hint: "free",
      },
      {
        name: "Gemini 2.0 Flash Lite",
        value: "gemini-2.0-flash-lite",
        hint: "free",
      },
      {
        name: "Gemini 2.5 Flash",
        value: "gemini-2.5-flash",
        hint: "free • fast",
      },
      {
        name: "Gemini 2.5 Pro",
        value: "gemini-2.5-pro",
        hint: "paid • best quality",
      },
      {
        name: "Gemini 1.5 Flash",
        value: "gemini-1.5-flash",
        hint: "free • stable",
      },
      {
        name: "Gemini 1.5 Pro",
        value: "gemini-1.5-pro",
        hint: "paid",
      },
    ],
  },

  {
    name: "OpenAI",
    value: "openai",
    models: [
      {
        name: "GPT-4.1 Mini",
        value: "gpt-4.1-mini",
        hint: "paid • recommended",
      },
      {
        name: "GPT-4.1",
        value: "gpt-4.1",
        hint: "paid • best quality",
      },
      {
        name: "GPT-4.1 Nano",
        value: "gpt-4.1-nano",
        hint: "paid • lightweight",
      },
      {
        name: "GPT-4o",
        value: "gpt-4o",
        hint: "paid • multimodal",
      },
      {
        name: "GPT-4o Mini",
        value: "gpt-4o-mini",
        hint: "free • fast",
      },
      {
        name: "GPT-4 Turbo",
        value: "gpt-4-turbo",
        hint: "paid",
      },
    ],
  },

  {
    name: "Hugging Face",
    value: "huggingface",
    models: [
      {
        name: "Llama 3 8B Instruct",
        value: "meta-llama/Meta-Llama-3-8B-Instruct",
        hint: "free • recommended",
      },
      {
        name: "Llama 3.1 8B Instruct",
        value: "meta-llama/Llama-3.1-8B-Instruct",
        hint: "free",
      },
      {
        name: "Llama 3.1 70B Instruct",
        value: "meta-llama/Llama-3.1-70B-Instruct",
        hint: "free • high quality",
      },
      {
        name: "Mistral 7B Instruct",
        value: "mistralai/Mistral-7B-Instruct-v0.3",
        hint: "free • lightweight",
      },
      {
        name: "Mixtral 8x7B Instruct",
        value: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        hint: "free • powerful",
      },
      {
        name: "Qwen 2 7B Instruct",
        value: "Qwen/Qwen2-7B-Instruct",
        hint: "free",
      },
      {
        name: "Qwen 2.5 7B Instruct",
        value: "Qwen/Qwen2.5-7B-Instruct",
        hint: "free • improved",
      },
      {
        name: "DeepSeek Coder 33B",
        value: "deepseek-ai/deepseek-coder-33b-instruct",
        hint: "free • coding",
      },
      {
        name: "Phi-3 Mini 4K",
        value: "microsoft/Phi-3-mini-4k-instruct",
        hint: "free • compact",
      },
    ],
  },
]

export function getAIProvider(config: Config): Promise<AIProvider> {
  switch (config.provider) {
    case "gemini":
      return Promise.resolve(new GeminiProvider(config.apiKey, config.model))
    case "huggingface":
      return Promise.resolve(
        new HuggingFaceProvider(config.apiKey, config.model)
      )
    case "openai":
    case "custom":
      return Promise.resolve(
        new OpenAIProvider(config.apiKey, config.model, config.baseUrl)
      )
    default:
      throw new Error(`Provider ${config.provider} is not supported.`)
  }
}
