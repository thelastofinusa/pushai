import { simpleGit } from "simple-git"
import chalk from "chalk"

const git = simpleGit()

export async function prepareGitStage() {
  const isRepo = await git.checkIsRepo()

  if (!isRepo) return { isRepo: false }

  const status = await git.status()

  if (
    status.not_added.length > 0 ||
    status.modified.length > 0 ||
    status.deleted.length > 0
  ) {
    await git.add(".")
  }

  const staged = await git.diff(["--cached"])

  return { isRepo: true, diff: staged }
}

export async function initRepo() {
  await git.init()
}
