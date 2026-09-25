import type { AIProvider } from "@pushai/types";
import OpenAI from "openai";
import { buildCommitPrompt, COMMIT_SYSTEM_PROMPT } from "../git/prompt";

export const openaiProvider: AIProvider = {
  id: "openai",
  name: "OpenAI",

  async getModels(apiKey) {
    const client = new OpenAI({ apiKey });
    const list = await client.models.list();

    return list.data.map((model) => ({
      id: model.id,
      name: model.id,
    }));
  },

  async generateCommitMessage(apiKey, model, diff, regenerate) {
    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model,
      max_tokens: 500,
      messages: [
        { role: "system", content: COMMIT_SYSTEM_PROMPT },
        { role: "user", content: buildCommitPrompt(diff, regenerate) },
      ],
    });

    const text = completion.choices[0]?.message?.content;

    if (!text) {
      throw new Error("OpenAI returned no commit message.");
    }

    return text.trim();
  },
};
