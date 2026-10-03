import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Entry } from "@napi-rs/keyring";
import type {
  ByokProviderConfig,
  CloudProviderConfig,
  LocalProviderConfig,
  ProviderConfig,
  SetupConfig,
} from "@pushai/types";

let _keyringUsable: boolean | null = null;

async function isKeyringUsable(): Promise<boolean> {
  if (_keyringUsable !== null) return _keyringUsable;

  try {
    const probe = new Entry("__pushai_probe__", "probe");
    probe.getPassword(); // Just checking if we can access the keyring
    _keyringUsable = true;
  } catch (error) {
    _keyringUsable = false;
    console.warn(
      "⚠️ System keychain unavailable. API keys will be stored in a local fallback file.",
    );
    if (process.env.DEBUG) console.warn(error);
  }

  return _keyringUsable;
}

function readJsonFile<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  } catch (error) {
    console.warn(`Unable to read configuration file: ${filePath}`);
    if (process.env.DEBUG) console.warn(error);
    return null;
  }
}

function writeJsonFile(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

type PersistedProvider =
  | Omit<ByokProviderConfig, "apiKey">
  | LocalProviderConfig
  | CloudProviderConfig;

interface PersistedConfig {
  activeId: string;
  providers: PersistedProvider[];
}

export interface ConfigStoreOptions {
  /** Keytar service name and directory name under ~/.config. */
  serviceName: string;
  /** Keytar account name prefix. Defaults to "api-key". */
  accountName?: string;
}

export function createConfigStore({
  serviceName,
  accountName = "api-key",
}: ConfigStoreOptions) {
  const configDir = () => path.join(os.homedir(), ".config", serviceName);
  const configPath = () => path.join(configDir(), "config.json");
  const keyPath = (providerId: string) =>
    path.join(configDir(), `key-${providerId}.json`);

  const ensureConfigDir = () => {
    fs.mkdirSync(configDir(), { recursive: true });
  };

  const accountFor = (providerId: string) => `${accountName}-${providerId}`;

  const getStoredApiKey = async (
    providerId: string,
  ): Promise<string | null> => {
    if (await isKeyringUsable()) {
      try {
        const entry = new Entry(serviceName, accountFor(providerId));
        return entry.getPassword();
      } catch (error) {
        console.warn("Unable to read API key from the system keychain.");
        if (process.env.DEBUG) console.warn(error);
        return null;
      }
    }

    return (
      readJsonFile<{ apiKey?: string }>(keyPath(providerId))?.apiKey ?? null
    );
  };

  const setStoredApiKey = async (
    providerId: string,
    apiKey: string,
  ): Promise<void> => {
    if (await isKeyringUsable()) {
      const entry = new Entry(serviceName, accountFor(providerId));
      entry.setPassword(apiKey);
      return;
    }

    ensureConfigDir();

    const file = keyPath(providerId);
    writeJsonFile(file, { apiKey });

    if (process.platform !== "win32") {
      try {
        fs.chmodSync(file, 0o600);
      } catch (error) {
        console.warn(`Unable to restrict permissions for ${file}`);
        if (process.env.DEBUG) console.warn(error);
      }
    }
  };

  const deleteStoredApiKey = async (providerId: string): Promise<boolean> => {
    let deleted = false;

    if (await isKeyringUsable()) {
      try {
        const entry = new Entry(serviceName, accountFor(providerId));
        if (entry.deletePassword()) {
          deleted = true;
        }
      } catch (error) {
        console.warn("Unable to delete API key from the system keychain.");
        if (process.env.DEBUG) console.warn(error);
      }
    }

    const file = keyPath(providerId);

    if (fs.existsSync(file)) {
      try {
        fs.unlinkSync(file);
        deleted = true;
      } catch (error) {
        console.warn(`Unable to delete API key fallback: ${file}`);
        if (process.env.DEBUG) console.warn(error);
      }
    }

    return deleted;
  };

  const getStoredConfig = async (): Promise<SetupConfig | null> => {
    const file = readJsonFile<PersistedConfig>(configPath());

    if (!file?.providers?.length || !file.activeId) return null;

    const providers: ProviderConfig[] = [];

    for (const p of file.providers) {
      if (p.mode === "byok") {
        const apiKey = await getStoredApiKey(p.id);
        // Skip providers whose key has gone missing rather than crash.
        if (!apiKey) continue;
        providers.push({ ...p, apiKey } as ByokProviderConfig);
      } else {
        providers.push(p as ProviderConfig);
      }
    }

    if (!providers.length) return null;

    const activeId = providers.some((p) => p.id === file.activeId)
      ? file.activeId
      : providers[0].id;

    return { activeId, providers };
  };

  const setStoredConfig = async (data: SetupConfig): Promise<void> => {
    ensureConfigDir();

    const persisted: PersistedProvider[] = [];

    for (const p of data.providers) {
      if (p.mode === "byok") {
        if (p.apiKey) await setStoredApiKey(p.id, p.apiKey);
        const { apiKey: _apiKey, ...rest } = p;
        persisted.push(rest);
      } else {
        persisted.push(p);
      }
    }

    writeJsonFile(configPath(), {
      activeId: data.activeId,
      providers: persisted,
    } satisfies PersistedConfig);
  };

  const addProvider = async (
    provider: ProviderConfig,
    setActive = false,
  ): Promise<void> => {
    const existing = await getStoredConfig();

    const config: SetupConfig = existing ?? {
      activeId: provider.id,
      providers: [],
    };

    const idx = config.providers.findIndex((p) => p.id === provider.id);
    if (idx >= 0) config.providers[idx] = provider;
    else config.providers.push(provider);

    if (setActive || !config.activeId) config.activeId = provider.id;

    await setStoredConfig(config);
  };

  const setActiveProvider = async (id: string): Promise<boolean> => {
    const existing = await getStoredConfig();
    if (!existing) return false;
    if (!existing.providers.some((p) => p.id === id)) return false;
    existing.activeId = id;
    await setStoredConfig(existing);
    return true;
  };

  const removeProvider = async (id: string): Promise<boolean> => {
    const existing = await getStoredConfig();
    if (!existing) return false;

    const provider = existing.providers.find((p) => p.id === id);
    if (!provider) return false;

    if (provider.mode === "byok") await deleteStoredApiKey(provider.id);

    const remaining = existing.providers.filter((p) => p.id !== id);

    if (!remaining.length) return resetStoredConfig();

    const activeId =
      existing.activeId === id ? remaining[0].id : existing.activeId;

    await setStoredConfig({ activeId, providers: remaining });
    return true;
  };

  const resetStoredConfig = async (): Promise<boolean> => {
    let anythingDeleted = false;

    try {
      const existingConfig = readJsonFile<PersistedConfig>(configPath());

      if (fs.existsSync(configDir())) {
        fs.rmSync(configDir(), { recursive: true, force: true });
        anythingDeleted = true;
      }

      if ((await isKeyringUsable()) && existingConfig?.providers) {
        for (const provider of existingConfig.providers) {
          if (provider.mode === "byok") {
            try {
              const entry = new Entry(serviceName, accountFor(provider.id));
              if (entry.deletePassword()) {
                anythingDeleted = true;
              }
            } catch (error) {
              if (process.env.DEBUG) console.warn(error);
            }
          }
        }
      }

      return anythingDeleted;
    } catch (error) {
      console.error("Failed to reset configuration:", error);
      return false;
    }
  };

  return {
    getConfigDir: configDir,
    getConfigPath: configPath,
    getStoredConfig,
    setStoredConfig,
    addProvider,
    setActiveProvider,
    removeProvider,
    resetStoredConfig,
  };
}

export type ConfigStore = ReturnType<typeof createConfigStore>;
