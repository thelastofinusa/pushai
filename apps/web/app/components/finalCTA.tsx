"use client"
import { useState } from "react"
import { motion } from "motion/react"
import { Check, Copy, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

export function FinalCTA() {
  const [copied, setCopied] = useState(false)
  const cmd = "npm install -g pushai"

  return (
    <section id="install" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-20 text-center sm:px-16 sm:py-28"
      >
        {/* layered ambient backgrounds */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--color-foreground)_0%,transparent_55%)] opacity-[0.05]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_100%,var(--color-foreground)_0%,transparent_40%)] opacity-[0.04]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_100%,var(--color-foreground)_0%,transparent_40%)] opacity-[0.04]" />
        {/* grid mask */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          }}
        />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 font-mono text-xs text-muted-foreground backdrop-blur">
            <Sparkles className="size-3" /> Free · MIT licensed
          </div>

          <h2 className="mx-auto mt-6 max-w-3xl text-4xl leading-[1.02] font-bold tracking-[-0.03em] sm:text-6xl lg:text-7xl">
            Stop writing commit messages.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Install PushAI in your next terminal session and let your repo write
            itself.
          </p>

          <div className="mx-auto mt-10 max-w-md">
            <div className="group relative">
              <div className="absolute -inset-px rounded-2xl bg-[linear-gradient(to_right,var(--color-foreground)/20%,var(--color-foreground)/5%,var(--color-foreground)/20%)] opacity-60 blur-sm" />
              <div className="relative flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-5 py-4 font-mono text-sm">
                <span className="text-success">%</span>
                <span className="flex-1 text-left text-foreground">{cmd}</span>
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
                    <Check className="size-4 text-success" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" className="h-12 gap-2 rounded-full px-6">
              Get started <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 gap-2 rounded-full px-6"
            >
              {/* <Github className="size-4" /> */}
              Star on GitHub
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
