import { ProviderType } from "../types"

export type AIProviderType = {
  name: string
  value: ProviderType
  models: {
    name: string
    value: string
    hint?: string
  }[]
}

export const aiProviders: AIProviderType[] = [
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
        name: "Gemini 2.0 Flash Lite",
        value: "gemini-2.0-flash-lite",
        hint: "free",
      },
      {
        name: "Gemini 2.5 Flash",
        value: "gemini-2.5-flash",
        hint: "free • fast",
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
    ],
  },
  {
    name: "Anthropic (Claude)",
    value: "anthropic",
    models: [
      {
        name: "Claude 3.5 Haiku",
        value: "claude-3-5-haiku-latest",
        hint: "fast • cheap • recommended",
      },
      {
        name: "Claude 3.5 Sonnet",
        value: "claude-3-5-sonnet-latest",
        hint: "best quality • paid",
      },
      {
        name: "Claude 3 Opus",
        value: "claude-3-opus-latest",
        hint: "highest quality • paid",
      },
    ],
  },
  {
    name: "Groq",
    value: "groq",
    models: [
      {
        name: "Llama 3.3 70B",
        value: "llama-3.3-70b-versatile",
        hint: "free • high quality",
      },
      {
        name: "Llama 3.1 8B",
        value: "llama-3.1-8b-instant",
        hint: "free • fast",
      },
      {
        name: "Mixtral 8x7B",
        value: "mixtral-8x7b-32768",
        hint: "free • good balance",
      },
      { name: "Gemma 2 9B", value: "gemma2-9b-it", hint: "free • lightweight" },
    ],
  },
]
