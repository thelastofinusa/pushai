/**
 * System and user prompts for commit generation.
 */
export const COMMIT_SYSTEM_PROMPT = `You are an expert Git commit assistant. 
Generate a clear, concise Conventional Commit message based on the provided diff.
Follow this format strictly:
<type>(<scope>): <short summary>

Rules:
1. Use imperative mood (e.g., "add feature", "fix bug").
2. No conversational fluff, markdown code blocks, or markdown wrappers. Return ONLY the raw commit string.
3. Types allowed: feat, fix, docs, style, refactor, perf, test, chore.`;

export function buildCommitPrompt(diff: string, branchName: string): string {
  return `Current Branch: ${branchName}

Staged Diff:
${diff}`;
}

/**
 * Prompts for Merge Conflict resolution.
 */
export const CONFLICT_SYSTEM_PROMPT = `You are a Git Merge Conflict Resolution Expert.
Analyze the conflicted file content provided and explain the conflict clearly in plain English.
Offer a suggested clean resolution.`;

export function buildConflictPrompt(
  filePath: string,
  conflictContent: string,
): string {
  return `File with conflict: ${filePath}

Conflict Markers Content:
${conflictContent}

Output Format:
1. Brief summary of what incoming changes conflict with current changes.
2. Suggested resolution code block.`;
}
