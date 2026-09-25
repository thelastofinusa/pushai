import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIProvider } from "@pushai/types";
import { hosts } from "@pushai/utils";
import { buildCommitPrompt, COMMIT_SYSTEM_PROMPT } from "../git/prompt";

export const geminiProvider: AIProvider = {
  id: "gemini",
  name: "Google Gemini",

  async getModels(apiKey) {
    const response = await fetch(`${hosts.gemini}/v1beta/models?key=${apiKey}`);

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

  async generateCommitMessage(apiKey, model, diff, regenerate) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const genModel = genAI.getGenerativeModel({
      model,
      systemInstruction: COMMIT_SYSTEM_PROMPT,
    });

    const result = await genModel.generateContent(
      buildCommitPrompt(diff, regenerate),
    );

    const text = result.response.text();

    if (!text) {
      throw new Error("Gemini returned no commit message.");
    }

    return text.trim();
  },
};
