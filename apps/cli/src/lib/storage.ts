import os from "os"
import path from "path"
import fs from "fs"
import keytar from "keytar"
import { Config } from "../types"
import { ACCOUNT_NAME, SERVICE_NAME } from "./constant"

let _keytarAvailable: boolean | null = null

async function isKeytarAvailable(): Promise<boolean> {
  if (_keytarAvailable !== null) return _keytarAvailable
  try {
    // Try a simple operation that doesn't require existing credentials
    await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME)
    _keytarAvailable = true
  } catch (err: any) {
    // keytar might be missing or throw on unsupported platform
    if (
      err.code === "ERR_MODULE_NOT_FOUND" ||
      err.message?.includes("keytar")
    ) {
      console.warn(
        "⚠️ Keytar not available – API keys will be stored in plain text. Install build tools to enable secure storage."
      )
    }
    _keytarAvailable = false
  }
  return _keytarAvailable
}

export async function getStoredConfig(): Promise<Partial<Config>> {
  const filePath = getConfigPath()
  let fileConfig: Partial<Config> = {}
  if (fs.existsSync(filePath)) {
    try {
      fileConfig = JSON.parse(fs.readFileSync(filePath, "utf-8"))
    } catch {}
  }

  let apiKey: string | null = null
  if (await isKeytarAvailable()) {
    apiKey = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME)
  } else {
    const keyFilePath = path.join(path.dirname(filePath), "key.json")
    if (fs.existsSync(keyFilePath)) {
      try {
        const keyData = JSON.parse(fs.readFileSync(keyFilePath, "utf-8"))
        apiKey = keyData.apiKey
      } catch {}
    }
  }

  if (apiKey) fileConfig.apiKey = apiKey
  return fileConfig
}

export async function setStoredConfig(data: Partial<Config>) {
  const filePath = getConfigPath()
  const { apiKey, ...rest } = data

  if (apiKey) {
    if (await isKeytarAvailable()) {
      await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, apiKey)
    } else {
      const keyFilePath = path.join(path.dirname(filePath), "key.json")
      fs.writeFileSync(
        keyFilePath,
        JSON.stringify({ apiKey }, null, 2),
        "utf-8"
      )
      try {
        fs.chmodSync(keyFilePath, 0o600)
      } catch {}
    }
  }

  let existing = {}
  if (fs.existsSync(filePath)) {
    try {
      existing = JSON.parse(fs.readFileSync(filePath, "utf-8"))
    } catch {}
  }
  const merged = { ...existing, ...rest }
  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), "utf-8")
}

export async function resetStoredConfig() {
  try {
    let anythingDeleted = false

    // 1. Delete config directory (contains provider & model)
    const configDir = path.join(os.homedir(), ".config", SERVICE_NAME)
    if (fs.existsSync(configDir)) {
      fs.rmSync(configDir, { recursive: true, force: true })
      anythingDeleted = true
    }

    // 2. Delete keychain entry (if keytar available)
    if (await isKeytarAvailable()) {
      const keytarDeleted = await keytar.deletePassword(
        SERVICE_NAME,
        ACCOUNT_NAME
      )
      if (keytarDeleted) anythingDeleted = true
    }

    // 3. Delete plaintext key fallback (if it exists)
    const configPath = getConfigPath()
    const keyFilePath = path.join(path.dirname(configPath), "key.json")
    if (fs.existsSync(keyFilePath)) {
      fs.unlinkSync(keyFilePath)
      anythingDeleted = true
    }

    return anythingDeleted
  } catch (error) {
    console.error("Failed to reset config:", error)
    return false
  }
}

export async function resetApiKeyOnly(): Promise<boolean> {
  try {
    let deleted = false

    if (await isKeytarAvailable()) {
      const keytarDeleted = await keytar.deletePassword(
        SERVICE_NAME,
        ACCOUNT_NAME
      )
      if (keytarDeleted) deleted = true
    }

    const configPath = getConfigPath()
    const keyFilePath = path.join(path.dirname(configPath), "key.json")
    if (fs.existsSync(keyFilePath)) {
      fs.unlinkSync(keyFilePath)
      deleted = true
    }

    return deleted
  } catch {
    return false
  }
}

export function getConfigPath() {
  const configDir = path.join(os.homedir(), ".config", SERVICE_NAME)
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true })
  }
  return path.join(configDir, "config.json")
}
