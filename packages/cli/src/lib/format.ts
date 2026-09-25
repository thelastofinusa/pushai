import type { ProviderConfig } from "@pushai/types";
import { headerIcons } from "@pushai/utils";

export function formatProvider(p: ProviderConfig): string {
  if (p.mode === "byok") return `${p.provider} ${headerIcons.dot} ${p.model}`;
  if (p.mode === "local") return `local ${headerIcons.dot} ${p.model}`;
  return `cloud ${headerIcons.dot} ${p.model}`;
}

export function providerModeLabel(p: ProviderConfig): string {
  if (p.mode === "byok") return p.provider;
  return p.mode;
}
