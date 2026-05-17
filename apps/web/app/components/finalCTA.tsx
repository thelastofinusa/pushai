"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { CheckCheck, Copy, Sparkles } from "lucide-react"

export function FinalCTA() {
  const [copied, setCopied] = useState(false)
  const cmd = "npm install -g pushai"

  return (
    <section id="install" className="mx-auto max-w-5xl px-4 py-24 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-xl border bg-linear-to-b from-transparent via-secondary/10 to-secondary/30 shadow-2xl shadow-black/10 backdrop-blur-md"
      >
        {/* Content */}
        <div className="px-6 py-12 text-center sm:px-12 sm:py-16">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 font-mono text-xs text-muted-foreground backdrop-blur">
            <Sparkles className="size-3" /> Free · MIT licensed
          </div>

          <h2 className="mx-auto mt-6 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Stop writing commit messages.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Install PushAI in your next terminal session and let AI handle your
            commits.
          </p>

          {/* Install command – styled like code blocks */}
          <div className="mx-auto mt-10 max-w-sm">
            <div className="group relative rounded-lg border bg-background p-3 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-success">$</span>
                <code className="flex-1 text-left text-foreground">{cmd}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(cmd)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1500)
                  }}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Copy install command"
                >
                  {copied ? (
                    <CheckCheck className="size-4 text-success" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
