import { Ora } from "ora"
import chalk from "chalk"

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
