import color, { ColorName } from "chalk"
import * as p from "@clack/prompts"

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Strips only surrounding quotes from a commit message,
 * preserving internal quotes (e.g., user's data).
 */
export function cleanCommitMessage(raw: string): string {
  return raw.trim().replace(/^['"]|['"]$/g, "")
}

type IntroOptions = {
  title: string
  badge?: string
  icon?: string
  badgeBgColor?: ColorName // e.g., 'bgCyan', 'bgRed'
  iconColor?: ColorName
}

export function renderIntro({
  title,
  badge = "PushAI",
  icon = "●",
  badgeBgColor = "bgCyan",
  iconColor = "cyan",
}: IntroOptions) {
  const badgeColorFn = color[badgeBgColor] || color.bgCyan
  const badgeStr = badgeColorFn.black.bold(` ${badge} `)
  const iconColored = (color[iconColor] || color.cyan)(icon)
  p.intro(`${iconColored} ${badgeStr} ${color.dim("→")} ${color.white(title)}`)
}

/* ------------------------------------------------------------------ */
/*  Human‑readable error extraction                                   */
/* ------------------------------------------------------------------ */

export function getReadableError(error: any): string {
  // 1. If the error has a nested `error` object (common in many APIs)
  const inner = error?.error || error?.error?.error // deeply nested
  if (typeof inner === "object" && inner?.message) {
    return String(inner.message)
  }
  if (typeof inner === "string") return inner

  // 2. Try to extract from error.message, which may be "401 { ... }"
  const rawMessage: string = error?.message || String(error)
  // Strip leading HTTP status code if present
  const jsonStart = rawMessage.search(/\{/) // find first '{'
  if (jsonStart !== -1) {
    try {
      const jsonPart = rawMessage.slice(jsonStart)
      const parsed = JSON.parse(jsonPart)
      // Common shapes: { error: { message: "..." } } or { message: "..." }
      if (parsed?.error?.message) return String(parsed.error.message)
      if (parsed?.message) return String(parsed.message)
    } catch {
      // ignore parsing errors
    }
  }

  // 3. Fallback: just use the raw message (or error string)
  return rawMessage
}
