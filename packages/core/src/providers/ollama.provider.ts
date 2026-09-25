import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { hosts } from "@pushai/utils";
import { Ollama } from "ollama";
import { buildCommitPrompt, COMMIT_SYSTEM_PROMPT } from "../git/prompt";
import { maxTokens } from "../lib/maxTokens";

const execFileAsync = promisify(execFile);

export const ollama = new Ollama({ host: hosts.ollama });

export interface OllamaInfo {
  installed: boolean;
  running: boolean;
  version?: string;
  models: string[];
}

async function ping(timeoutMs = 500): Promise<boolean> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(`${hosts.ollama}/api/tags`, {
      signal: ctrl.signal,
    });

    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function isOllamaRunning(): Promise<boolean> {
  try {
    const res = await fetch(`${hosts.ollama}/api/tags`, {
      signal: AbortSignal.timeout(1000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function ensureOllamaRunning(): Promise<void> {
  if (await isOllamaRunning()) return;

  // Spawn detached so it survives CLI exit and doesn't block the event loop.
  const child = spawn("ollama", ["serve"], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();

  // Poll until the server is reachable (max ~5s).
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 250));
    if (await isOllamaRunning()) return;
  }

  throw new Error(
    "Ollama is not running and could not be started automatically. Start it manually with: ollama serve",
  );
}

async function startOllama(): Promise<boolean> {
  try {
    const child = spawn("ollama", ["serve"], {
      detached: true,
      stdio: "ignore",
    });

    child.unref();

    for (let i = 0; i < 20; i++) {
      if (await ping(500)) {
        return true;
      }

      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    return false;
  } catch {
    return false;
  }
}

export async function ensureModel(
  model: string,
  onProgress?: (pct: number) => void,
) {
  const { models } = await ollama.list();

  if (models.some((m) => m.name === model)) return;

  for await (const part of await ollama.pull({
    model,
    stream: true,
  })) {
    if (part.total && part.completed) {
      const pct = Math.round((part.completed / part.total) * 100);
      onProgress?.(pct);
    }
  }
}

export async function ollamaProvider(): Promise<OllamaInfo> {
  let version: string | undefined;

  try {
    const { stdout, stderr } = await execFileAsync("ollama", ["-v"]);

    version = `${stdout}${stderr}`.match(/(\d+\.\d+\.\d+)/)?.[1];
  } catch {
    return {
      installed: false,
      running: false,
      models: [],
    };
  }

  let running = await ping();

  if (!running) {
    running = await startOllama();
  }

  if (!running) {
    return {
      installed: true,
      running: false,
      version,
      models: [],
    };
  }

  try {
    const { models } = await ollama.list();

    return {
      installed: true,
      running: true,
      version,
      models: models.map((model) => model.name),
    };
  } catch {
    return {
      installed: true,
      running: true,
      version,
      models: [],
    };
  }
}

export async function generateCommitMessageLocal(
  model: string,
  diff: string,
  regenerate?: boolean,
): Promise<string> {
  await ensureOllamaRunning();

  const response = await ollama.chat({
    model,
    stream: false,
    messages: [
      { role: "system", content: COMMIT_SYSTEM_PROMPT },
      { role: "user", content: buildCommitPrompt(diff, regenerate) },
    ],
    options: {
      temperature: 0.3,
      num_predict: maxTokens,
    },
  });

  const text = response.message?.content?.trim();

  if (!text) {
    throw new Error(
      "No commit message was generated. Try switching to a non-reasoning model.",
    );
  }

  return text;
}
