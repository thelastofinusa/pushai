import type { SetupConfig } from "@pushai/types";
import { providers } from "../providers";
import { generateCommitMessageLocal } from "../providers/ollama.provider";

export async function generateCommitMessage(
  config: SetupConfig,
  diff: string,
  regenerate?: boolean,
): Promise<string> {
  if (!diff.trim()) {
    throw new Error("No staged changes to generate a commit message from.");
  }

  const active = config.providers.find((p) => p.id === config.activeId);

  if (!active) {
    throw new Error("No active provider configured. Run `pai setup`.");
  }

  if (active.mode === "local") {
    return generateCommitMessageLocal(active.model, diff, regenerate);
  }

  if (active.mode === "byok") {
    const provider = providers.find((p) => p.id === active.provider);

    if (!provider) {
      throw new Error(`Unknown provider: ${active.provider}`);
    }

    return provider.generateCommitMessage(
      active.apiKey,
      active.model,
      diff,
      regenerate,
    );
  }

  throw new Error("Cloud commit generation isn't available yet.");
}
