import type { SetupConfig } from "@/types";
import { providers } from "../providers";
import { generateCommitMessageLocal } from "../providers/ollama.provider";

/** How many times we'll retry when the provider returns junk instead of a message. */
const MAX_ATTEMPTS = 4;

/** Responses that are clearly NOT a plain 2-line commit message. */
const INVALID_OUTPUT_PATTERNS: RegExp[] = [
  /^\s*```/, // any markdown fence, including ```json
  /^\s*\{/, // raw JSON object
  /^\s*<(commit|message|response)>/i, // pseudo-XML wrappers
];

export function isInvalidCommitMessage(text: string): boolean {
  return INVALID_OUTPUT_PATTERNS.some((re) => re.test(text));
}

export interface GenerateCommitMessageOptions {
  /** Force a fresh generation (used by the CLI's "regenerate" menu item). */
  regenerate?: boolean;
  /** Override the max attempts. Defaults to 4. */
  maxAttempts?: number;
  /** Called right before a retry, so the CLI can update `spinner.text`. */
  onRetry?: (info: {
    attempt: number;
    maxAttempts: number;
    reason: string;
  }) => void;
}

export async function generateCommitMessage(
  config: SetupConfig,
  diff: string,
  options: GenerateCommitMessageOptions | boolean = {},
): Promise<string> {
  if (!diff.trim()) {
    throw new Error("No staged changes to generate a commit message from.");
  }

  // Backwards compat: the old 3rd param was `boolean`.
  const opts: GenerateCommitMessageOptions =
    typeof options === "boolean" ? { regenerate: options } : options;

  const active = config.providers.find((p) => p.id === config.activeId);
  if (!active) {
    throw new Error("No active provider configured. Run `pai setup`.");
  }

  const maxAttempts = opts.maxAttempts ?? MAX_ATTEMPTS;
  let regenerate = opts.regenerate ?? false;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const text = await runOnce(active, diff, regenerate);

    if (!isInvalidCommitMessage(text)) {
      return text;
    }

    opts.onRetry?.({
      attempt,
      maxAttempts,
      reason: "response was formatted as JSON or a code fence",
    });

    // Every retry after the first must ask the model for something different,
    // otherwise it'll happily return the same fenced JSON again.
    regenerate = true;
  }

  throw new Error(
    `The provider returned non-message output ${maxAttempts} times in a row. ` +
      `Try a different model, or pass a message with \`-m\`.`,
  );
}

async function runOnce(
  active: SetupConfig["providers"][number],
  diff: string,
  regenerate: boolean,
): Promise<string> {
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
