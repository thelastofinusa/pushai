import type { PushAIConfig } from "../types";
import { cloudApiUrl } from "../utils/urls";

export async function queryPushAICloud(
  config: PushAIConfig,
  prompt: string,
  systemPrompt?: string,
): Promise<string> {
  const baseUrl = config.cloudApiUrl || `${cloudApiUrl}/api`;

  const response = await fetch(`${baseUrl}/ai/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.cloudToken}`,
    },
    body: JSON.stringify({
      prompt,
      systemPrompt,
      model: config.model,
    }),
  });

  if (!response.ok) {
    if (response.status === 402) {
      throw new Error(
        "Usage quota exceeded. Please upgrade your subscription or add credits.",
      );
    }
    throw new Error(`PushAI Cloud error: ${response.statusText}`);
  }

  const data = (await response.json()) as { text: string };
  return data.text.trim();
}
