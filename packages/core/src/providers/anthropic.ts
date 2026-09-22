import type { AIProvider } from "@pushai/types";

export const anthropicProvider: AIProvider = {
  id: "anthropic",
  name: "Anthropic",

  async getModels(apiKey) {
    const response = await fetch("https://api.anthropic.com/v1/models", {
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
};
