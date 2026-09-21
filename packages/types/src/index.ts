// ========== Types

export type SetupMode = "cloud" | "byok" | "local";

export type SetupConfig =
  | {
      mode: "local";
      model: string;
    }
  | {
      mode: "byok";
      provider: string;
      apiKey: string;
      model: string;
    }
  | {
      mode: "cloud";
      model: string;
    };

// ========== Interfaces

export interface AIProvider {
  id: string;
  name: string;
  getModels(apiKey: string): Promise<AIModel[]>;
}

export interface AIModel {
  id: string;
  name: string;
}
