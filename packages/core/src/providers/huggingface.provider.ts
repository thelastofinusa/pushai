import { InferenceClient } from "@huggingface/inference";
import type { AIProvider } from "@pushai/types";
import { hosts } from "@pushai/utils";
import { buildCommitPrompt, COMMIT_SYSTEM_PROMPT } from "../git/prompt";
import { maxTokens } from "../lib/maxTokens";

export const huggingfaceProvider: AIProvider = {
  id: "huggingface",
  name: "Hugging Face",

  async getModels(apiKey) {
    const response = await fetch(`${hosts.huggingface}/v1/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(
        error?.error?.message ??
          `Hugging Face request failed (${response.status})`,
      );
    }

    const data = await response.json();

    return (data.data ?? []).map((model: { id: string }) => ({
      id: model.id,
      name: model.id,
    }));
  },

  async generateCommitMessage(apiKey, model, diff, regenerate) {
    const client = new InferenceClient(apiKey);

    const result = await client.chatCompletion({
      model,
      messages: [
        { role: "system", content: COMMIT_SYSTEM_PROMPT },
        { role: "user", content: buildCommitPrompt(diff, regenerate) },
      ],
      max_tokens: maxTokens,
    });

    const text = result.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("Hugging Face returned no commit message.");
    }

    return text.trim();
  },
};
