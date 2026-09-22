import type { AIProvider } from "@pushai/types";

export const geminiProvider: AIProvider = {
  id: "gemini",
  name: "Google Gemini",

  async getModels(apiKey) {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models",
      {
        headers: {
          "x-goog-api-key": apiKey,
        },
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => null);

      throw new Error(
        error?.error?.message ?? `Gemini request failed (${response.status})`,
      );
    }

    const data = await response.json();

    return data.models
      .filter((model: { supportedGenerationMethods?: string[] }) =>
        model.supportedGenerationMethods?.includes("generateContent"),
      )
      .map((model: { name: string; displayName?: string }) => ({
        id: model.name.replace(/^models\//, ""),
        name: model.displayName ?? model.name.replace(/^models\//, ""),
      }));
  },
};
