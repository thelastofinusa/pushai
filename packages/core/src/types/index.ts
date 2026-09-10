import { z } from "zod";
import { cloudApiUrl, ollamaBaseUrl } from "../utils/urls";

// Zod Schema for Config Validation
export const PushAIConfigSchema = z.object({
  mode: z.enum(["cloud", "byok", "local"]),
  provider: z.enum(["openai", "anthropic", "groq", "ollama", "pushai-cloud"]),
  model: z.string().min(1),
  apiKey: z.string().optional(),
  cloudToken: z.string().optional(),
  cloudApiUrl: z.url().optional().default(`${cloudApiUrl}/api`),
  ollamaBaseUrl: z.url().optional().default(ollamaBaseUrl),
});

export type PushAiConfigSchemaType = z.infer<typeof PushAIConfigSchema>;

export type ExecutionMode = PushAiConfigSchemaType["mode"];

export type AIProvider = PushAiConfigSchemaType["provider"];

export interface PushAIConfig {
  mode: ExecutionMode;
  provider: AIProvider;
  model: string;
  apiKey?: string;
  cloudToken?: string;
  cloudApiUrl?: string;
  ollamaBaseUrl?: string;
}

export interface GitStatusResult {
  currentBranch: string;
  stagedFiles: string[];
  hasConflicts: boolean;
  conflictFiles: string[];
}

export interface MergeConflictFile {
  filePath: string;
  conflictContent: string;
}

export interface CommitSuggestion {
  title: string;
  rawCommitMessage: string;
}

export interface ConflictAnalysisResult {
  filePath: string;
  explanation: string;
  suggestedFix: string;
}

export interface AICompletionOptions {
  prompt: string;
  systemPrompt?: string;
  config: PushAIConfig;
}
