import type { ProviderConfig } from "@pushai/types";
import { headerIcons } from "@pushai/utils";

export function formatProvider(
  p: ProviderConfig,
  withBracket: boolean = false,
): string {
  const model = withBracket ? `[${p.model}]` : `${headerIcons.dot} ${p.model}`;

  if (p.mode === "byok") return `${p.provider} ${model}`;
  if (p.mode === "local") return `local ${model}`;
  return `cloud ${model}`;
}

export function formatRemoteUrl(value: string): string {
  let input = value.trim();

  // Remove trailing slashes
  input = input.replace(/\/+$/, "");

  // GitHub shorthand: username/repo
  if (/^[\w.-]+\/[\w.-]+(?:\.git)?$/.test(input)) {
    return `https://github.com/${input.endsWith(".git") ? input : `${input}.git`}`;
  }

  // GitHub URL without a protocol
  if (/^(?:www\.)?github\.com\/[\w.-]+\/[\w.-]+(?:\.git)?$/i.test(input)) {
    input = `https://${input}`;
  }

  // Normalize github.com URLs
  try {
    const url = new URL(input);

    if (url.hostname === "github.com" || url.hostname === "www.github.com") {
      url.protocol = "https:";
      url.hostname = "github.com";
      url.pathname = url.pathname.replace(/\/+$/, "");

      if (!url.pathname.endsWith(".git")) {
        url.pathname += ".git";
      }

      return url.toString();
    }
  } catch {
    // Try SSH/scp-style URLs below
  }

  // git@github.com:user/repo
  const sshMatch = input.match(
    /^git@github\.com:([\w.-]+)\/([\w.-]+)(?:\.git)?$/i,
  );

  if (sshMatch) {
    const [, owner, repo] = sshMatch;
    return `git@github.com:${owner}/${repo.endsWith(".git") ? repo : `${repo}.git`}`;
  }

  // ssh://git@github.com/user/repo
  const sshUrlMatch = input.match(
    /^ssh:\/\/git@github\.com\/([\w.-]+)\/([\w.-]+)(?:\.git)?$/i,
  );

  if (sshUrlMatch) {
    const [, owner, repo] = sshUrlMatch;
    return `git@github.com:${owner}/${repo.endsWith(".git") ? repo : `${repo}.git`}`;
  }

  // Preserve valid non-GitHub Git URLs.
  // Generic Git servers may use their own URL structure.
  if (/^(https?|ssh):\/\//i.test(input) || /^git@[^:]+:.+/.test(input)) {
    return input;
  }

  throw new Error(
    "invalid repository URL. Use username/repo or a valid Git URL.",
  );
}
