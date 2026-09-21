// import fs from "node:fs";
// import os from "node:os";
// import path from "node:path";
// import type { SetupConfig } from "@pushai/types";
// import keytar from "keytar";

// let _keytarUsable: boolean | null = null;

// const SERVICE_NAME = "pushai";
// const ACCOUNT_NAME = "api-key";

// /**
//  * Returns the directory where application configuration is stored.
//  *
//  * This function is intentionally pure:
//  * it does not create anything on disk.
//  */
// export function getConfigDir(): string {
//   return path.join(os.homedir(), ".config", SERVICE_NAME);
// }

// /**
//  * Returns the path to the main configuration file.
//  *
//  * This function does not create the directory.
//  */
// export function getConfigPath(): string {
//   return path.join(getConfigDir(), "config.json");
// }

// /**
//  * Returns the path to the plaintext API-key fallback.
//  */
// export function getKeyPath(): string {
//   return path.join(getConfigDir(), "key.json");
// }

// /**
//  * Makes sure the configuration directory exists.
//  */
// function ensureConfigDir(): void {
//   fs.mkdirSync(getConfigDir(), {
//     recursive: true,
//   });
// }

// /**
//  * Checks whether the system keychain is usable.
//  *
//  * The result is cached for the lifetime of the process.
//  */
// async function isKeytarUsable(): Promise<boolean> {
//   if (_keytarUsable !== null) {
//     return _keytarUsable;
//   }

//   try {
//     // A read operation is enough to verify that the native
//     // keychain integration can actually be used.
//     await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);

//     _keytarUsable = true;
//   } catch (error) {
//     _keytarUsable = false;

//     console.warn(
//       "⚠️ System keychain unavailable. API keys will be stored in a local fallback file.",
//     );

//     if (process.env.DEBUG) {
//       console.warn(error);
//     }
//   }

//   return _keytarUsable;
// }

// /**
//  * Reads JSON from a file.
//  */
// function readJsonFile<T>(filePath: string): T | null {
//   if (!fs.existsSync(filePath)) {
//     return null;
//   }

//   try {
//     return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
//   } catch (error) {
//     console.warn(`Unable to read configuration file: ${filePath}`);

//     if (process.env.DEBUG) {
//       console.warn(error);
//     }

//     return null;
//   }
// }

// /**
//  * Writes JSON to a file.
//  */
// function writeJsonFile(filePath: string, data: unknown): void {
//   fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
// }

// /**
//  * Reads the stored API key.
//  *
//  * Uses the OS credential store when available,
//  * otherwise falls back to key.json.
//  */
// async function getStoredApiKey(): Promise<string | null> {
//   if (await isKeytarUsable()) {
//     try {
//       return await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
//     } catch (error) {
//       console.warn("Unable to read API key from the system keychain.");

//       if (process.env.DEBUG) {
//         console.warn(error);
//       }

//       return null;
//     }
//   }

//   const keyData = readJsonFile<{ apiKey?: string }>(getKeyPath());

//   return keyData?.apiKey ?? null;
// }

// /**
//  * Stores the API key.
//  *
//  * Uses the OS credential store when available,
//  * otherwise falls back to a chmod-600 file.
//  */
// async function setStoredApiKey(apiKey: string): Promise<void> {
//   if (await isKeytarUsable()) {
//     await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, apiKey);

//     return;
//   }

//   ensureConfigDir();

//   const keyPath = getKeyPath();

//   writeJsonFile(keyPath, {
//     apiKey,
//   });

//   // Restrict access to the current user on POSIX systems.
//   // Windows handles file permissions differently.
//   if (process.platform !== "win32") {
//     try {
//       fs.chmodSync(keyPath, 0o600);
//     } catch (error) {
//       console.warn(`Unable to restrict permissions for ${keyPath}`);

//       if (process.env.DEBUG) {
//         console.warn(error);
//       }
//     }
//   }
// }

// /**
//  * Deletes the stored API key from both possible locations.
//  */
// async function deleteStoredApiKey(): Promise<boolean> {
//   let deleted = false;

//   if (await isKeytarUsable()) {
//     try {
//       const keytarDeleted = await keytar.deletePassword(
//         SERVICE_NAME,
//         ACCOUNT_NAME,
//       );

//       if (keytarDeleted) {
//         deleted = true;
//       }
//     } catch (error) {
//       console.warn("Unable to delete API key from the system keychain.");

//       if (process.env.DEBUG) {
//         console.warn(error);
//       }
//     }
//   }

//   const keyPath = getKeyPath();

//   if (fs.existsSync(keyPath)) {
//     try {
//       fs.unlinkSync(keyPath);
//       deleted = true;
//     } catch (error) {
//       console.warn(`Unable to delete API key fallback: ${keyPath}`);

//       if (process.env.DEBUG) {
//         console.warn(error);
//       }
//     }
//   }

//   return deleted;
// }

// /**
//  * Gets the complete stored configuration.
//  *
//  * The API key is loaded from the system keychain when possible.
//  */
// export async function getStoredConfig(): Promise<Partial<SetupConfig>> {
//   const configPath = getConfigPath();

//   const fileConfig = readJsonFile<Partial<SetupConfig>>(configPath) ?? {};

//   const apiKey = await getStoredApiKey();

//   if (apiKey) {
//     fileConfig.apiKey = apiKey;
//   }

//   return fileConfig;
// }

// /**
//  * Stores configuration values.
//  *
//  * The API key is kept separately from the normal config file.
//  */
// export async function setStoredConfig(
//   data: Partial<SetupConfig>,
// ): Promise<void> {
//   ensureConfigDir();

//   const configPath = getConfigPath();
//   const { apiKey, ...rest } = data;

//   // Store API key separately.
//   if (apiKey) {
//     await setStoredApiKey(apiKey);
//   }

//   // Preserve existing configuration.
//   const existing = readJsonFile<Record<string, unknown>>(configPath) ?? {};

//   const merged = {
//     ...existing,
//     ...rest,
//   };

//   writeJsonFile(configPath, merged);
// }

// /**
//  * Deletes the entire stored configuration.
//  *
//  * This removes:
//  * - config.json
//  * - plaintext key.json
//  * - the config directory
//  * - the system keychain credential
//  */
// export async function resetStoredConfig(): Promise<boolean> {
//   let anythingDeleted = false;

//   try {
//     // Delete the system keychain entry first.
//     if (await deleteStoredApiKey()) {
//       anythingDeleted = true;
//     }

//     // Delete the entire local configuration directory.
//     const configDir = getConfigDir();

//     if (fs.existsSync(configDir)) {
//       fs.rmSync(configDir, {
//         recursive: true,
//         force: true,
//       });

//       anythingDeleted = true;
//     }

//     return anythingDeleted;
//   } catch (error) {
//     console.error("Failed to reset configuration:", error);

//     return false;
//   }
// }

// /**
//  * Deletes only the stored API key.
//  *
//  * Other configuration values remain untouched.
//  */
// export async function resetApiKeyOnly(): Promise<boolean> {
//   try {
//     return await deleteStoredApiKey();
//   } catch (error) {
//     console.error("Failed to reset API key:", error);

//     return false;
//   }
// }
