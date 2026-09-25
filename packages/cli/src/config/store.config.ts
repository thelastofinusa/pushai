import { createConfigStore } from "@pushai/core";
import type { SetupConfig } from "@pushai/types";
import { name } from "../../package.json";

export const configStore = createConfigStore({ serviceName: name });

export async function getConfigAndRun(): Promise<SetupConfig | null> {
  const config = await configStore.getStoredConfig();
  if (config) return config;

  const { reRunSetup } = await import("../commands/reRunSetup");
  const ran = await reRunSetup();

  if (!ran) return null;

  return configStore.getStoredConfig();
}
