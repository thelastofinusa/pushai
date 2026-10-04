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
