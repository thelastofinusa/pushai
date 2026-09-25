import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider } from "@pushai/types";
import { buildCommitPrompt, COMMIT_SYSTEM_PROMPT } from "../git/prompt";

export const anthropicProvider: AIProvider = {
  id: "anthropic",
  name: "Anthropic",

  async getModels(apiKey) {
    const client = new Anthropic({ apiKey });
    const response = await fetch(`${client.baseURL}/v1/models`, {
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(
        error?.error?.message ??
          `Anthropic request failed (${response.status})`,
      );
    }

    const data = await response.json();

    return data.data.map((model: { id: string; display_name: string }) => ({
      id: model.id,
      name: model.display_name,
    }));
  },

  async generateCommitMessage(apiKey, model, diff, regenerate) {
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model,
      max_tokens: 500,
      system: COMMIT_SYSTEM_PROMPT,
      messages: [
        { role: "user", content: buildCommitPrompt(diff, regenerate) },
      ],
    });

    const text = message.content.find((block) => block.type === "text")?.text;

    if (!text) {
      throw new Error("Anthropic returned no commit message.");
    }

    return text.trim();
  },
};
