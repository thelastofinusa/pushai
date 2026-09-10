import type { PushAIConfig } from "../types";
import { openAiUrl } from "../utils/urls";

export async function queryBYOKProvider(
  config: PushAIConfig,
  prompt: string,
  systemPrompt?: string,
): Promise<string> {
  if (!config.apiKey) {
    throw new Error("API Key missing for BYOK mode.");
  }

  // Example implementation for OpenAI API directly from CLI
  if (config.provider === "openai") {
    const response = await fetch(`${openAiUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model || "gpt-4o-mini",
        messages: [
          ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    return data.choices[0]?.message.content.trim() || "";
  }

  throw new Error(`BYOK Provider [${config.provider}] not fully configured.`);
}
