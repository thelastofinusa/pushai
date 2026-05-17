export const GENERATE_COMMIT_PROMPT = (diff: string, regenerate = false) => {
  let prompt = `
Generate a single conventional commit message from the git diff.

Rules:
- Output exactly ONE line
- Maximum 200 characters
- Lowercase only
- No markdown
- No quotes
- No explanations
- Must be a complete commit message
- Never output placeholders or incomplete text
- Format: <type>(<scope>): <description>

Use one of the Conventional Commits type (feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert).

Examples:
feat(auth): add wallet connection modal
fix(cli): prevent empty commit generation
refactor(api): simplify gemini provider setup

Guidelines:
- Focus on the most important change
- Describe the outcome, not implementation details
- Avoid vague words like "update" or "change"
- Use specific scopes when relevant

Git diff:
${diff}
`

  if (regenerate) {
    prompt += `

Generate a DIFFERENT commit message for the same diff.
Use a different perspective or emphasis while following all rules.
`
  }

  return prompt.trim()
}
