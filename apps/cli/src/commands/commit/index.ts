import { runCommitFlow } from "./flow"

export async function runCommit() {
  await runCommitFlow()
}

export async function runCommitDry() {
  await runCommitFlow({ dry: true })
}

export async function runCommitPush() {
  await runCommitFlow({ autoPush: true })
}

export async function runCommitMsg(message: string) {
  await runCommitFlow({ message })
}
