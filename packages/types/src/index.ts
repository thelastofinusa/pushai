export type SetupMode = "cloud" | "byok" | "local";

export interface LocalProviderConfig {
  id: "local";
  mode: "local";
  model: string;
}

export interface ByokProviderConfig {
  id: string; // provider id, e.g. "openai"
  mode: "byok";
  provider: string;
  apiKey: string;
  model: string;
}

export interface CloudProviderConfig {
  id: "cloud";
  mode: "cloud";
  model: string;
}

export type ProviderConfig =
  | LocalProviderConfig
  | ByokProviderConfig
  | CloudProviderConfig;

export interface SetupConfig {
  /** id of the currently active provider */
  activeId: string;
  providers: ProviderConfig[];
}

export interface AIProvider {
  id: string;
  name: string;
  getModels(apiKey: string): Promise<AIModel[]>;
  generateCommitMessage(
    apiKey: string,
    model: string,
    diff: string,
    regenerate?: boolean,
  ): Promise<string>;
}

export interface AIModel {
  id: string;
  name: string;
}

export interface OllamaInfo {
  installed: boolean;
  running: boolean;
  version?: string;
  models: string[];
}

export interface CommitFlowOptions {
  autoPush?: boolean;
  dryRun?: boolean;
  customMessage?: string;
}

export interface GitChangeSummary {
  changed: number;
  conflicted: string[];
  files: string[];
}

export interface GitService {
  isRepo(): Promise<boolean>;
  init(): Promise<void>;
  getCurrentBranch(): Promise<string>;
  getStatus(): Promise<GitChangeSummary>;
  getDiff(staged?: boolean): Promise<string>;
  hasRemote(name?: string): Promise<boolean>;
  hasUpstream(branch: string): Promise<boolean>;
  stageAll(): Promise<void>;
  unstageAll(): Promise<void>;
  add(path: string | string[]): Promise<void>;
  commit: (message: string) => Promise<string>;
  push(branch: string, remote?: string): Promise<void>;
}
