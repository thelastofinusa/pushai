import type { AIProvider } from "@pushai/types";

import { anthropicProvider } from "./anthropic";
import { geminiProvider } from "./gemini";
import { openaiProvider } from "./openai";

export const providers: AIProvider[] = [
  geminiProvider,
  openaiProvider,
  anthropicProvider,
];
