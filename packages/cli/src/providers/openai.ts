import type { AIProvider } from "@pushai/types";

export const openaiProvider: AIProvider = {
  id: "openai",
  name: "OpenAI",

  async getModels(apiKey) {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);

      throw new Error(
        error?.error?.message ?? `OpenAI request failed (${response.status})`,
      );
    }

    const data = await response.json();

    return data.data.map((model: { id: string }) => ({
      id: model.id,
      name: model.id,
    }));
  },
};
