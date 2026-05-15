// apps/cli/src/utils/config.ts
import os from "os"
import path from "path"
import fs from "fs"
import keytar from "keytar"
import { Config } from "../types"

const SERVICE_NAME = "pushai"
const ACCOUNT_NAME = "api-key"

export async function getStoredConfig(): Promise<Partial<Config>> {
  const filePath = getConfigPath()
  let fileConfig: Partial<Config> = {}
  if (fs.existsSync(filePath)) {
    try {
      fileConfig = JSON.parse(fs.readFileSync(filePath, "utf-8"))
    } catch {}
  }

  // Retrieve API key from keychain
  const apiKey = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME)
  if (apiKey) {
    fileConfig.apiKey = apiKey
  }
  return fileConfig
}

export async function setStoredConfig(data: Partial<Config>) {
  const filePath = getConfigPath()
  const { apiKey, ...rest } = data

  // Store API key in keychain
  if (apiKey) {
    await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, apiKey)
  }

  // Write non‑secret data to file
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
    const home = os.homedir()
    const configDir = path.join(home, ".config", "pushai")
    let deleted = false
    if (fs.existsSync(configDir)) {
      fs.rmSync(configDir, { recursive: true, force: true })
      deleted = true
    }
    // Also delete from keychain
    await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME)
    return deleted
  } catch (error) {
    console.error("Failed to reset config:", error)
    return false
  }
}

export function getConfigPath() {
  const configDir = path.join(os.homedir(), ".config", "pushai")

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true })
  }

  return path.join(configDir, "config.json")
}
