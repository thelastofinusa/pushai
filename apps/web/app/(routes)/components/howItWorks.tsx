"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "motion/react"
import { Check } from "lucide-react"

const PREFIXES = [
  "pai",
  "pushai",
  "npx pushai",
  "bunx pushai",
  "pnpm dlx pushai",
  "yarn pushai",
]

const Typewriter = ({ subcommand }: { subcommand: string }) => {
  const [displayed, setDisplayed] = useState("")
  const [prefixIndex, setPrefixIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fullCommand = `${PREFIXES[prefixIndex]} ${subcommand}`

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started) {
          setStarted(true)
        }
      },
      { threshold: 0.5, rootMargin: "0px" }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return

    if (charIndex < fullCommand.length) {
      const timer = setTimeout(() => {
        setDisplayed(fullCommand.slice(0, charIndex + 1))
        setCharIndex(charIndex + 1)
      }, 40)
      return () => clearTimeout(timer)
    } else {
      const pauseTimer = setTimeout(() => {
        setDisplayed("")
        setCharIndex(0)
        setPrefixIndex((prev) => (prev + 1) % PREFIXES.length)
      }, 3000)
      timeoutRef.current = pauseTimer
      return () => clearTimeout(pauseTimer)
    }
  }, [started, charIndex, prefixIndex, fullCommand])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div ref={ref} className="flex items-center gap-2">
      <span className="text-success">$</span>
      <span className="text-foreground">
        {displayed}
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="ml-1"
        >
          █
        </motion.span>
      </span>
    </div>
  )
}

const steps = [
  {
    subcommand: "config",
    title: "Configure a provider",
    desc: "Choose an AI provider, add your API key, and select a model.",
  },
  {
    subcommand: "commit",
    title: "Commit and push",
    desc: "Generate a commit message, review it, then commit and push changes.",
  },
  {
    subcommand: "reset",
    title: "Reset anytime",
    desc: "Remove saved configuration and API keys to start fresh anytime.",
  },
  {
    subcommand: "list",
    title: "Browse models",
    desc: "View available AI providers along with their supported models.",
  },
]

const flags = [
  {
    flag: "-d, --dry-run",
    applies: "commit",
    desc: "Preview the generated message without committing or pushing changes.",
  },
  {
    flag: "-p, --push",
    applies: "commit",
    desc: "Skip confirmation and immediately commit and push changes.",
  },
  {
    flag: "-m, --message <msg>",
    applies: "commit",
    desc: "Use a custom commit message instead of AI generation.",
  },
  {
    flag: "-y, --yes",
    applies: "reset",
    desc: "Skip confirmation and remove saved configuration instantly.",
  },
  {
    flag: "-e, --edit",
    applies: "config",
    desc: "Open the PushAI configuration file in your default editor.",
  },
  {
    flag: "-p, --provider <name>",
    applies: "config",
    desc: "Set an AI provider directly from the terminal.",
  },
  {
    flag: "-m, --model <id>",
    applies: "config",
    desc: "Choose a model directly without interactive prompts.",
  },
  {
    flag: "-k, --key <apiKey>",
    applies: "config",
    desc: "Save an API key directly from the command line.",
  },
  {
    flag: "--peek",
    applies: "config",
    desc: "Show the currently saved provider, model, and API key.",
  },
]

export const HowItWorks = () => {
  return (
    <section id="how" className="mx-auto max-w-[1320px] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-lg text-center">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          How it works
        </p>
        <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Everything you need to use PushAI.
        </h2>
      </div>

      {/* Commands section (3 columns) */}
      <div className="mt-14 grid divide-y divide-border rounded-xl border bg-linear-to-b from-transparent via-secondary/10 to-secondary/30 shadow-2xl shadow-black/10 backdrop-blur-md md:grid-cols-2 md:divide-x lg:grid-cols-4 lg:divide-y-0">
        {steps.map((s, i) => (
          <motion.div
            key={s.subcommand}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex flex-col gap-6 p-6 md:p-8"
          >
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium tracking-tight">{s.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </div>

            <div className="mt-auto overflow-hidden rounded-lg border bg-background backdrop-blur">
              <div className="flex items-center gap-1 border-b px-3 py-2 sm:px-4">
                <span className="size-2 rounded-full bg-[#ff5f57]" />
                <span className="size-2 rounded-full bg-[#febc2e]" />
                <span className="size-2 rounded-full bg-[#28c840]" />
                <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                  ~/terminal
                </span>
              </div>
              <div className="space-y-3 px-4 py-2 font-mono text-[13px] leading-relaxed">
                <Typewriter subcommand={s.subcommand} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Flags section – same three‑column layout */}
      <div className="mt-14">
        <div className="mx-auto max-w-lg text-center">
          <h3 className="text-2xl font-semibold tracking-tight">
            Command flags and optional arguments
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            Customize how commands run directly from the terminal.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-5xl divide-y divide-border overflow-hidden rounded-xl border bg-linear-to-b from-transparent via-secondary/10 to-secondary/30 shadow-2xl shadow-black/10 backdrop-blur-md lg:grid-cols-3 lg:divide-x">
          {flags.map((f, i) => (
            <motion.div
              key={f.flag}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col gap-3 p-6 md:p-8"
            >
              <div>
                <div className="flex items-center gap-2">
                  <code className="rounded bg-background/60 px-2 py-1 font-mono text-[13px] font-medium">
                    {f.flag}
                  </code>
                  <span className="rounded-full border px-1.5 py-px font-mono text-[10px]">
                    {f.applies}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        {[
          "Open source",
          "MIT licensed",
          "Bring your own key",
          "Add custom model ID",
        ].map((t) => (
          <span key={t} className="inline-flex items-center gap-1.5">
            <Check className="size-3.5 text-success" />{" "}
            <span className="font-mono">{t}</span>
          </span>
        ))}
      </div>
    </section>
  )
}
