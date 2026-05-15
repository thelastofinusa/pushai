import { simpleGit } from "simple-git"

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

export async function hasRemote(): Promise<boolean> {
  try {
    const remotes = await git.getRemotes()
    return remotes.length > 0
  } catch {
    return false
  }
}
