import type { AIProvider } from "@pushai/types";
import { anthropicProvider } from "./anthropic.provider";
import { geminiProvider } from "./gemini.provider";
import { huggingfaceProvider } from "./huggingface.provider";
import { openaiProvider } from "./openai.provider";

export const providers: AIProvider[] = [
  geminiProvider,
  anthropicProvider,
  openaiProvider,
  huggingfaceProvider,
];
