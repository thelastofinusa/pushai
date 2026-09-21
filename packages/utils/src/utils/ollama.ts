import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Ollama } from "ollama";

const execFileAsync = promisify(execFile);

const HOST = "http://127.0.0.1:11434";

export const ollama = new Ollama({ host: HOST });

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
    const res = await fetch(`${HOST}/api/tags`, {
      signal: ctrl.signal,
    });

    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function getOllamaInfo(): Promise<OllamaInfo> {
  let installed = false;
  let version: string | undefined;

  try {
    const { stdout, stderr } = await execFileAsync("ollama", ["-v"]);

    installed = true;
    version = `${stdout}${stderr}`.match(/(\d+\.\d+\.\d+)/)?.[1];
  } catch {
    return {
      installed: false,
      running: false,
      models: [],
    };
  }

  const running = await ping();

  if (!running) {
    return {
      installed,
      running: false,
      version,
      models: [],
    };
  }

  try {
    const { models } = await ollama.list();

    return {
      installed,
      running: true,
      version,
      models: models.map((model) => model.name),
    };
  } catch {
    return {
      installed,
      running: true,
      version,
      models: [],
    };
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
