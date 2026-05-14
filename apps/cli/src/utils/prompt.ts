export const GENERATE_COMMIT_PROMPT = (diff: string) => {
  return `You are an expert developer. Analyze the following "git diff" and generate a single-line commit message following the Conventional Commits format. Return ONLY the message. No markdown, no quotes.

Rules:
1. Use lowercase.
2. Max 50 characters.
3. Format: type(scope): description.

Diff: ${diff}`
}
