"use client"

import { motion } from "motion/react"
import { useState } from "react"
import { Copy, CheckCheck } from "lucide-react"

const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative rounded-lg border bg-background p-3 font-mono text-sm">
      <code className="text-foreground">{code}</code>
      <button
        onClick={copyToClipboard}
        className="absolute top-2 right-2 rounded-md p-1 opacity-0 transition group-hover:opacity-100 hover:bg-secondary"
        aria-label="Copy"
      >
        {copied ? (
          <CheckCheck className="h-4 w-4 text-success" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  )
}

export const CommandsSection = () => {
  const commands = [
    { cmd: "pai commit", desc: "Stage, generate, approve, commit, and push." },
    {
      cmd: "pai config",
      desc: "Interactive setup (provider, API key, model).",
    },
    { cmd: "pai reset", desc: "Delete all configuration and API keys." },
  ]

  const flags = [
    {
      flag: "--dry-run",
      applies: "commit",
      desc: "Preview message – no commit or push.",
    },
    {
      flag: "--push / -p",
      applies: "commit",
      desc: "Skip approval, commit and push immediately.",
    },
    {
      flag: "--yes / -y",
      applies: "reset",
      desc: "Skip confirmation, delete config non‑interactively.",
    },
  ]

  return (
    <section id="commands" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-lg text-center">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          CLI reference
        </p>
        <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Commands & flags
        </h2>
        <p className="mt-4 text-muted-foreground">
          Everything you need to automate your Git workflow.
        </p>
      </div>

      {/* Main grid – same style as HowItWorks cards */}
      <div className="mt-14 grid gap-8 md:grid-cols-2">
        {/* Commands card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="rounded-xl border bg-linear-to-b from-transparent via-secondary/10 to-secondary/30 p-6 backdrop-blur-md"
        >
          <h3 className="mb-4 text-xl font-semibold tracking-tight">
            Commands
          </h3>
          <div className="space-y-3">
            {commands.map((c, i) => (
              <motion.div
                key={c.cmd}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-start gap-3 border-b border-border/50 pb-3 last:border-0"
              >
                <code className="shrink-0 rounded bg-background/60 px-2 py-0.5 font-mono text-sm font-medium">
                  {c.cmd}
                </code>
                <span className="text-sm text-muted-foreground">{c.desc}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Flags card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-xl border bg-linear-to-b from-transparent via-secondary/10 to-secondary/30 p-6 backdrop-blur-md"
        >
          <h3 className="mb-4 text-xl font-semibold tracking-tight">Flags</h3>
          <div className="space-y-3">
            {flags.map((f, i) => (
              <motion.div
                key={f.flag}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex flex-col gap-1 border-b border-border/50 pb-3 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <code className="rounded bg-background/60 px-2 py-0.5 font-mono text-sm">
                    {f.flag}
                  </code>
                  <span className="text-xs text-muted-foreground">
                    ({f.applies})
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">{f.desc}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Examples box – same style as the terminal windows in HowItWorks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-10 overflow-hidden rounded-xl border bg-linear-to-b from-transparent via-secondary/10 to-secondary/30 backdrop-blur-md"
      >
        <div className="flex items-center gap-1 border-b px-4 py-2">
          <span className="size-2 rounded-full bg-[#ff5f57]" />
          <span className="size-2 rounded-full bg-[#febc2e]" />
          <span className="size-2 rounded-full bg-[#28c840]" />
          <span className="ml-2 font-mono text-xs text-muted-foreground">
            examples ~/pushai
          </span>
        </div>
        <div className="space-y-3 p-6">
          <h3 className="font-mono text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            Try these
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <CodeBlock code="pai commit --push" />
            <CodeBlock code="pai -p" />
            <CodeBlock code="pai reset --yes" />
            <CodeBlock code="pai commit --dry-run" />
          </div>
        </div>
      </motion.div>
    </section>
  )
}
