import React from "react"
import { cn } from "@workspace/ui/lib/utils"

export const Terminal = ({
  title = "pushai",
  content,
  className,
}: {
  title?: string
  content: string
  className?: string
}) => {
  const formatLine = (line: string, index: number) => {
    // Provider badge
    if (line.includes("GEMINI")) {
      return (
        <div key={index} className="mt-3 text-terminal-foreground/90">
          <span className="text-terminal-foreground/40">┌ </span>
          <span className="text-cyan-400">●</span>{" "}
          <span className="bg-cyan-500 px-2 text-xs font-semibold text-black">
            GEMINI
          </span>{" "}
          <span>• gemini-3.1-flash-lite</span>
        </div>
      )
    }

    // Success line
    if (line.startsWith("✔")) {
      return (
        <div key={index} className="text-terminal-foreground/90">
          <span className="text-green-400">✔</span>{" "}
          <span>{line.replace("✔ ", "")}</span>
        </div>
      )
    }

    // Commit preview header
    if (line.startsWith("◇")) {
      const match = line.match(/^(◇\s.*?)(─+╮)$/)

      if (match) {
        return (
          <div key={index} className="text-terminal-foreground/90">
            <span>{match[1]}</span>

            <span className="text-terminal-foreground/40">{match[2]}</span>
          </div>
        )
      }

      return (
        <div key={index} className="text-cyan-400">
          {line}
        </div>
      )
    }

    // Action prompt
    if (line.startsWith("◆")) {
      return (
        <div key={index} className="text-cyan-500">
          {line}
        </div>
      )
    }

    // Selected option
    if (line.includes("● Commit")) {
      return (
        <div key={index} className="text-terminal-foreground/90">
          <span className="text-cyan-400">●</span>{" "}
          <span>{line.replace("● ", "")}</span>
        </div>
      )
    }

    // Unselected options
    if (line.includes("○")) {
      return (
        <div key={index} className="text-terminal-foreground/60">
          {line}
        </div>
      )
    }

    // Outro line
    if (line.startsWith("└")) {
      return (
        <div key={index} className="text-terminal-foreground/90">
          <span className="text-terminal-foreground/40">└ </span>

          <span className="text-green-400">{line.replace("└ ", "")}</span>
        </div>
      )
    }

    // Borders / pipes
    if (
      line.startsWith("│") ||
      line.startsWith("├") ||
      line.startsWith("╰") ||
      line.startsWith("╯")
    ) {
      return (
        <div key={index} className="text-terminal-foreground/40">
          {line}
        </div>
      )
    }

    // Default
    return (
      <div key={index} className="text-terminal-foreground/90">
        {line}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-terminal-border bg-terminal text-terminal-foreground shadow-2xl shadow-black/20 backdrop-blur",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-terminal-border px-4 py-3">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />

        <span className="ml-3 font-mono text-xs text-terminal-foreground/60">
          {title}
        </span>
      </div>

      <div className="p-5 font-mono text-[13px] whitespace-pre-wrap sm:p-5 sm:text-sm">
        {content.split("\n").map(formatLine)}
      </div>
    </div>
  )
}
