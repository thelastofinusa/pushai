// ========== Types

export type SetupMode = "cloud" | "byok" | "local";

// ========== Interfaces

export interface SetupConfig {
  mode: SetupMode;
  apiKey?: string;
  model: string;
}
