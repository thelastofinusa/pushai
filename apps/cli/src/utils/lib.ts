import { Ora } from "ora"
import chalk from "chalk"
import { checkForUpdates } from "./update"

export function createSlowSpinner(
  spinner: Ora,
  slow10: string,
  slow60: string
) {
  const timeout10 = setTimeout(() => {
    if (spinner.isSpinning) {
      spinner.color = "yellow"
      spinner.text = chalk.yellow(slow10)
    }
  }, 10000)

  const timeout60 = setTimeout(() => {
    if (spinner.isSpinning) {
      spinner.color = "red"
      spinner.text = chalk.red(slow60)
    }
  }, 60000)

  return () => {
    clearTimeout(timeout10)
    clearTimeout(timeout60)

    spinner.color = "cyan"
  }
}

// Helper to run a command and then check for updates asynchronously
export async function runCommandAndCheckUpdates(fn: () => Promise<void>) {
  try {
    await fn()
  } finally {
    // Fire-and-forget update check (non-blocking)
    checkForUpdates().catch(() => {})
  }
}
