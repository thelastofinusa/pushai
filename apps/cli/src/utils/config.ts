import os from "os"
import path from "path"
import fs from "fs"
import { Config } from "../types"

export const getStoredConfig = () => {
  const filePath = getConfigPath()
  if (!fs.existsSync(filePath)) return {}

  try {
    const data = fs.readFileSync(filePath, "utf-8")
    return JSON.parse(data)
  } catch {
    return {}
  }
}

export const resetStoredConfig = () => {
  try {
    const home = os.homedir()
    const configDir = path.join(home, ".config", "pushai")

    if (fs.existsSync(configDir)) {
      fs.rmSync(configDir, { recursive: true, force: true })
      return true
    }
    return false
  } catch (error) {
    console.error("Failed to reset config:", error)
    return false
  }
}

export const setStoredConfig = (data: Partial<Config>) => {
  try {
    const filePath = getConfigPath()
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")
  } catch (error) {
    console.error("Failed to write config file:", error)
  }
}

export function getConfigPath() {
  const configDir = path.join(os.homedir(), ".config", "pushai")

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true })
  }

  return path.join(configDir, "config.json")
}
