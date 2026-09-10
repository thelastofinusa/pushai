import type { AICompletionOptions } from "../types";
import { ollamaBaseUrl } from "../utils/urls";
import { queryBYOKProvider } from "./byok";
import { queryPushAICloud } from "./cloud";
import { queryOllama } from "./ollama";

/**
 * Fast detection of local Ollama server with timeout.
 */
export async function detectOllama(baseUrl = ollamaBaseUrl): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600);

    const response = await fetch(`${baseUrl}/api/tags`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Universal AI Completion Router.
 */
export async function generateAICompletion(
  options: AICompletionOptions,
): Promise<string> {
  const { config, prompt, systemPrompt } = options;

  if (config.mode === "local") {
    return queryOllama(config, prompt, systemPrompt);
  }

  if (config.mode === "cloud") {
    return queryPushAICloud(config, prompt, systemPrompt);
  }

  if (config.mode === "byok") {
    return queryBYOKProvider(config, prompt, systemPrompt);
  }

  throw new Error(`Unsupported execution mode: ${config.mode}`);
}
