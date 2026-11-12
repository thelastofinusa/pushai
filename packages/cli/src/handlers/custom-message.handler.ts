import { input, select } from "@inquirer/prompts";
import { headerIcons, spinner } from "@pushai/utils";
import chalk from "chalk";

const COMMIT_TYPES = [
  { value: "feat", description: "a new feature" },
  { value: "fix", description: "a bug fix" },
  { value: "docs", description: "documentation only changes" },
  { value: "style", description: "formatting, missing semicolons, etc" },
  {
    value: "refactor",
    description: "code change that neither fixes a bug nor adds a feature",
  },
  { value: "perf", description: "code change that improves performance" },
  { value: "test", description: "adding or correcting tests" },
  { value: "build", description: "changes to build system or dependencies" },
  { value: "ci", description: "CI configuration changes" },
  {
    value: "chore",
    description: "other changes that don't modify src or test files",
  },
  { value: "revert", description: "reverts a previous commit" },
] as const;

const VALID_TYPES: ReadonlySet<string> = new Set(
  COMMIT_TYPES.map((t) => t.value),
);

const CONVENTIONAL_COMMIT_REGEX = /^(\w+)(\([^)]+\))?!?:\s.+/;
const SCOPE_REGEX = /^[a-z0-9._-]+$/;

export function isConventionalCommit(message: string): boolean {
  return CONVENTIONAL_COMMIT_REGEX.test(message.trim());
}

export async function handleCustomMessage(
  rawMessage: string,
  overrides: { type?: string; scope?: string } = {},
): Promise<string> {
  const trimmed = rawMessage.trim();

  // Already `feat(docs): ...` → nothing to do.
  if (isConventionalCommit(trimmed)) return trimmed;

  // ── Resolve type ────────────────────────────────────────────────────
  let type = overrides.type?.trim().toLowerCase();

  if (type && !VALID_TYPES.has(type)) {
    spinner.fail(
      `invalid --type "${type}". valid types: ${[...VALID_TYPES].join(", ")}`,
    );
    process.exit(1);
  }

  // ── Resolve scope (only meaningful when type is set) ────────────────
  let scope = overrides.scope?.trim().toLowerCase();

  if (scope && !type) {
    spinner.warn(
      "--scope requires --type, falling back to interactive prompt.",
    );
    scope = undefined;
  }

  if (scope && !SCOPE_REGEX.test(scope)) {
    spinner.fail(
      `invalid --scope "${scope}". use lowercase letters, digits, dots, dashes, or underscores.`,
    );
    process.exit(1);
  }

  // ── Fall back to prompts for anything not supplied via flags ────────
  if (!type) {
    type = await select({
      message: `select a commit type for ${headerIcons.branchLast} ${chalk.cyan(`"${trimmed}"`)}`,
      choices: COMMIT_TYPES.map((t) => ({
        name: `${chalk.cyan(t.value.padEnd(9))} ${chalk.dim(t.description)}`,
        value: t.value,
        description: t.description,
      })),
    });
  }

  if (scope === undefined) {
    scope = await input({
      message: "enter a scope (optional, press enter to skip):",
      default: "",
      validate: (value) => {
        if (!value.trim()) return true;
        return SCOPE_REGEX.test(value.trim())
          ? true
          : "scope must be lowercase letters, digits, dots, dashes, or underscores.";
      },
    });
    scope = scope?.trim();
  }

  const prefix = scope ? `${type}(${scope})` : type;
  return `${prefix}: ${trimmed}`;
}
