"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@workspace/ui/lib/utils"

const TREE = new Set(["┌", "│", "└", "├", "╮", "╯", "╭", "╰", "─"])

// Mapping from badge text to Tailwind classes
const badgeStyles: Record<string, { bg: string; icon: string }> = {
  "PushAI Commit": { bg: "bg-cyan-500", icon: "text-cyan-500" },
  "PushAI Config": { bg: "bg-cyan-500", icon: "text-cyan-500" },
  "PushAI Reset": { bg: "bg-red-500", icon: "text-red-500" },
  "PushAI Explorer": { bg: "bg-fuchsia-500", icon: "text-fuchsia-500" },
  "Setup Required": { bg: "bg-yellow-500", icon: "text-yellow-500" },
}

function renderLine(line: string, i: number) {
  // Special case: commit message preview line (starts with "│ ◆ ")
  // Example: "│ ◆ refactor(auth): swap JWT for httpOnly cookies"
  if (line.match(/^│\s+◆\s+/)) {
    const diamondIndex = line.indexOf("◆")
    const prefix = line.slice(0, diamondIndex) // includes "│ " and any spaces before ◆
    const rest = line.slice(diamondIndex) // from "◆" to the end
    return (
      <div key={i} className="whitespace-pre">
        <span className="text-muted-foreground">{prefix}</span>
        <span className="text-cyan-400">{rest}</span>
      </div>
    )
  }

  // Try to match a badge line: ┌ ● PushAI Reset → Clear saved configuration
  const badgeMatch = line.match(/^([^●]*)●\s+([^→]+)→\s*(.*)$/)
  if (badgeMatch) {
    const [, prefix, badgeTextRaw, rest] = badgeMatch
    const badgeText = badgeTextRaw?.trim()

    // Only apply badge styling if badgeText exists and is a known badge
    if (badgeText && badgeStyles[badgeText]) {
      const styles = badgeStyles[badgeText]
      const bulletColor = styles.icon
      const badgeBg = styles.bg

      return (
        <div key={i} className="whitespace-pre">
          <span className="text-muted-foreground">{prefix}</span>
          <span className={bulletColor}>●</span>
          <span className="text-muted-foreground"> </span>
          <span
            className={cn(
              "px-1.5 py-px text-[11px] font-medium text-black",
              badgeBg
            )}
          >
            {badgeText}
          </span>
          <span className="text-muted-foreground"> </span>
          <span className="text-muted-foreground">→</span>
          <span className="text-muted-foreground"> </span>
          <span className="text-foreground">{rest}</span>
        </div>
      )
    }
  }

  const chars: React.ReactNode[] = []
  let buf = ""
  let bufClass = ""

  const flush = () => {
    if (!buf) return
    chars.push(
      <span key={`${i}-${chars.length}`} className={bufClass}>
        {buf}
      </span>
    )
    buf = ""
  }

  // Find which badge (if any) is present in the line
  let matchedBadge: string | null = null
  let badgeBgClass = "bg-cyan-500" // fallback
  let badgeIconColor = "text-cyan-400"

  for (const [text, styles] of Object.entries(badgeStyles)) {
    // Badge appears as "● BadgeText →" in the line
    if (line.includes(`● ${text} →`)) {
      matchedBadge = text
      badgeBgClass = styles.bg
      badgeIconColor = styles.icon
      break
    }
  }

  // If no badge, fallback to simple per‑character rendering (no special badge span)
  if (!matchedBadge) {
    for (let j = 0; j < line.length; j++) {
      const ch = line[j] as string
      let cls = "text-muted-foreground"

      if (TREE.has(ch)) cls = "text-muted-foreground"
      else if (ch === "◇") cls = "text-cyan-500"
      else if (ch === "◆") cls = "text-cyan-500"
      else if (ch === "✔") cls = "text-green-500"
      else if (ch === "●") cls = "text-cyan-500"
      else if (ch === "○") cls = "text-muted-foreground"
      else if (ch === "$") cls = "text-emerald-500"

      if (cls !== bufClass) {
        flush()
        bufClass = cls
      }
      buf += ch
    }
    flush()
    return (
      <div key={i} className="whitespace-pre">
        {chars.length ? chars : "\u00A0"}
      </div>
    )
  }

  // Line contains a badge – split into three parts: before, badge, after
  const badgePattern = `● ${matchedBadge} →`
  const badgeIndex = line.indexOf(badgePattern)
  const beforeBadge = line.substring(0, badgeIndex)
  const afterBadge = line.substring(badgeIndex + badgePattern.length)

  // Render part before badge (usually just "●" and maybe a space)
  for (let j = 0; j < beforeBadge.length; j++) {
    const ch = beforeBadge[j] as string
    let cls = "text-muted-foreground"
    if (ch === "●") cls = badgeIconColor
    else if (TREE.has(ch)) cls = "text-muted-foreground"

    if (cls !== bufClass) {
      flush()
      bufClass = cls
    }
    buf += ch
  }
  flush()

  // Render badge span
  chars.push(
    <span
      key={`${i}-badge`}
      className={`${badgeBgClass} px-1.5 py-0.5 text-[11px] font-semibold text-black`}
    >
      {matchedBadge}
    </span>
  )

  // Render the arrow and the rest of the line
  for (let j = 0; j < afterBadge.length; j++) {
    const ch = afterBadge[j] as string
    let cls = "text-muted-foreground"

    if (TREE.has(ch)) cls = "text-muted-foreground"
    else if (ch === "→") cls = badgeIconColor
    else if (ch === "◇") cls = "text-cyan-400"
    else if (ch === "◆") cls = "text-cyan-300"
    else if (ch === "✔") cls = "text-green-400"
    else if (ch === "●") cls = badgeIconColor
    else if (ch === "○") cls = "text-muted-foreground"
    else if (ch === "$") cls = "text-emerald-400"

    if (cls !== bufClass) {
      flush()
      bufClass = cls
    }
    buf += ch
  }
  flush()

  return (
    <div key={i} className="whitespace-pre">
      {chars.length ? chars : "\u00A0"}
    </div>
  )
}

export const Terminal = ({
  title = "pushai",
  command = "",
  output = [],
  className,
}: {
  title?: string
  command?: string
  output?: string[]
  className?: string
}) => {
  const [typed, setTyped] = useState("")
  const [visibleLines, setVisibleLines] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || hasStarted) return
    if (!command) {
      console.warn("Terminal: command prop is empty")
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true)
          }
        })
      },
      { threshold: 0.2, rootMargin: "0px" }
    )

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [hasStarted, command])

  // Typing effect – runs when hasStarted becomes true
  useEffect(() => {
    if (!hasStarted) return
    if (!command) return

    setTyped("")
    setVisibleLines(0)

    let current = 0
    let typeInterval: NodeJS.Timeout | null = null
    let outputInterval: NodeJS.Timeout | null = null

    typeInterval = setInterval(() => {
      current++
      setTyped(command.slice(0, current))

      if (current >= command.length) {
        if (typeInterval) clearInterval(typeInterval)
        let line = 0

        outputInterval = setInterval(() => {
          line++
          setVisibleLines(line)

          if (line >= output.length) {
            if (outputInterval) clearInterval(outputInterval)
          }
        }, 160)
      }
    }, 40)

    return () => {
      if (typeInterval) clearInterval(typeInterval)
      if (outputInterval) clearInterval(outputInterval)
    }
  }, [hasStarted, command, output])

  return (
    <div
      ref={containerRef}
      className={cn(
        "overflow-hidden rounded-xl border bg-background text-muted-foreground shadow-2xl shadow-black/10 backdrop-blur",
        className
      )}
    >
      <div className="flex items-center gap-1.5 border-b px-4 py-2.5 sm:px-5">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-xs text-muted-foreground">
          {title}
        </span>
      </div>

      <div className="min-h-36 p-4 font-mono text-[11px] leading-[1.55] sm:p-5 sm:text-xs">
        <div className="mb-3 whitespace-pre text-foreground">
          <span className="text-green-500">$ </span>
          {typed}
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
            className="ml-1"
          >
            █
          </motion.span>
        </div>

        <AnimatePresence>
          {output?.slice(0, visibleLines).map((line, i) => (
            <motion.div
              key={`${line}-${i}`}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderLine(line, i)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
