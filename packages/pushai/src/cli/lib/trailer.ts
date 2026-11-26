import { pkgConfig } from "../config/config.config";

/**
 * Appended to every commit created via `pai commit`.
 *
 * - Shows up in `git log -1` and `git show` (it's in the commit body).
 * - NOT parsed by GitHub as a co-author (unlike `Co-authored-by:`), so no
 *   avatar badge — the commit author stays you.
 * - NOT shown in the CLI preview — callers strip it via `stripPushAITrailer`
 *   before calling `showCommitMessage`.
 * - Uses the canonical site URL from `apps/web/config/site.config.ts` since
 *   PushAI doesn't have a custom domain yet. Swap this single line when it
 *   does (`https://pushai.dev` or whatever).
 */
export const PUSHAI_URL = pkgConfig.homepage;

/** Non-co-author trailer — GitHub treats it as ordinary text. */
export const PUSHAI_TRAILER = `Generated-with: PushAI (${PUSHAI_URL})`;

/** Returns the message with the trailer appended, without duplicating it. */
export function withPushAITrailer(message: string): string {
  const trimmed = message.trimEnd();
  if (trimmed.endsWith(PUSHAI_TRAILER)) return trimmed;
  return `${trimmed}\n\n${PUSHAI_TRAILER}`;
}

/** Removes the trailer from a message (for CLI previews). */
export function stripPushAITrailer(message: string): string {
  return message
    .replace(new RegExp(`\\n*${escapeRegex(PUSHAI_TRAILER)}\\s*$`), "")
    .trimEnd();
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
