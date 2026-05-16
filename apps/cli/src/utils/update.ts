import fs from "fs"
import path from "path"
import os from "os"
import chalk from "chalk"
import { version as currentVersion, name } from "../../package.json"

const UPDATE_CACHE_DIR = path.join(os.homedir(), ".config", "pushai")
const UPDATE_CACHE_FILE = path.join(UPDATE_CACHE_DIR, "update-check.json")
const CACHE_TTL_MS = 1 * 60 * 60 * 1000 // 1 hours

interface UpdateCache {
  lastCheck: number
  latestVersion: string | null
}

function getCache(): UpdateCache {
  if (!fs.existsSync(UPDATE_CACHE_FILE)) {
    return { lastCheck: 0, latestVersion: null }
  }
  try {
    return JSON.parse(fs.readFileSync(UPDATE_CACHE_FILE, "utf-8"))
  } catch {
    return { lastCheck: 0, latestVersion: null }
  }
}

function setCache(latestVersion: string | null) {
  if (!fs.existsSync(UPDATE_CACHE_DIR)) {
    fs.mkdirSync(UPDATE_CACHE_DIR, { recursive: true })
  }
  const cache: UpdateCache = { lastCheck: Date.now(), latestVersion }
  fs.writeFileSync(UPDATE_CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8")
}

async function fetchLatestVersion(): Promise<string | null> {
  try {
    const response = await fetch(`https://registry.npmjs.org/${name}/latest`)
    if (!response.ok) return null
    const data = await response.json()
    return data.version || null
  } catch {
    return null
  }
}

export async function checkForUpdates(): Promise<void> {
  const cache = getCache()
  const now = Date.now()

  // If cache is still fresh, use it
  if (
    cache.lastCheck &&
    now - cache.lastCheck < CACHE_TTL_MS &&
    cache.latestVersion
  ) {
    if (cache.latestVersion !== currentVersion) {
      showUpdateMessage(cache.latestVersion)
    }
    return
  }

  // Otherwise fetch latest asynchronously (don't await)
  fetchLatestVersion()
    .then((latest) => {
      if (latest && latest !== currentVersion) {
        setCache(latest)
        showUpdateMessage(latest)
      } else if (latest) {
        setCache(latest) // update cache even if same version
      } else {
        setCache(null)
      }
    })
    .catch(() => {
      // Silently ignore fetch errors
    })
}

function showUpdateMessage(latestVersion: string) {
  console.log(
    chalk.yellow(`
╭─────────────────────────────────────────────────────────────╮
│  Update available! ${chalk.dim(currentVersion)} → ${chalk.green.bold(latestVersion)}
│  Run ${chalk.cyan(`npm install -g ${name}`)} to upgrade.
╰─────────────────────────────────────────────────────────────╯
`)
  )
}
