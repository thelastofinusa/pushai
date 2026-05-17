"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@workspace/ui/lib/utils"

const TREE = new Set(["┌", "│", "└", "├", "╮", "╯", "╭", "╰", "─"])

function renderLine(line: string, i: number) {
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

  for (let j = 0; j < line.length; j++) {
    const ch = line[j] as string

    let cls = "text-muted-foreground"

    if (TREE.has(ch)) cls = "text-muted-foreground"
    else if (ch === "◇") cls = "text-[#7dd3fc]"
    else if (ch === "✔") cls = "text-success"
    else if (ch === "●") cls = "text-[#22d3ee]"
    else if (ch === "○") cls = "text-muted-foreground"
    else if (ch === "$") cls = "text-success"

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
            console.log("Terminal is visible, starting animation")
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

    console.log("Starting typing for command:", command)
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

      <div className="min-h-36 p-4 font-mono text-[12.5px] leading-[1.55] sm:p-5 sm:text-[13px]">
        <div className="mb-3 whitespace-pre text-foreground">
          <span className="text-success">$ </span>
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
