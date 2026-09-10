import type { PushAIConfig } from "../types";
import { ollamaBaseUrl } from "../utils/urls";

export async function queryOllama(
  config: PushAIConfig,
  prompt: string,
  systemPrompt?: string,
): Promise<string> {
  const url = `${config.ollamaBaseUrl || ollamaBaseUrl}/api/generate`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.model,
      prompt,
      system: systemPrompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.statusText}`);
  }

  const data = (await response.json()) as { response: string };
  return data.response.trim();
}
