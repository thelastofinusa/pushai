import type { ProviderConfig } from "@pushai/types";

export function formatProvider(p: ProviderConfig): string {
  if (p.mode === "byok") return `${p.provider} · ${p.model}`;
  if (p.mode === "local") return `local · ${p.model}`;
  return `cloud · ${p.model}`;
}

export function providerModeLabel(p: ProviderConfig): string {
  if (p.mode === "byok") return p.provider;
  return p.mode;
}
