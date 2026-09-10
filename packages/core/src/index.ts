export * from "./git";
export * from "./prompts";
export * from "./providers";
export * from "./types";

import { getGitStatus, getStagedDiff } from "./git";
import { buildCommitPrompt, COMMIT_SYSTEM_PROMPT } from "./prompts";
import { generateAICompletion } from "./providers";
import type { PushAIConfig } from "./types";

/**
 * Single call to generate standard commit message from staged changes.
 */
export async function generateCommitMessage(
  config: PushAIConfig,
): Promise<string> {
  const status = await getGitStatus();

  if (status.stagedFiles.length === 0) {
    throw new Error("No staged changes found. Please run 'git add' first.");
  }

  const diff = await getStagedDiff();
  const prompt = buildCommitPrompt(diff, status.currentBranch);

  return generateAICompletion({
    config,
    prompt,
    systemPrompt: COMMIT_SYSTEM_PROMPT,
  });
}
