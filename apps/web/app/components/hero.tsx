"use client"
import { useEffect, useMemo, useState } from "react"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Terminal } from "@/components/terminal"
import { siteConfig } from "@/config/site.config"
import Link from "next/link"
import { Separator } from "@workspace/ui/components/separator"

const demos = [
  {
    title: "config",
    command: "pai config",
    output: [
      "┌ Welcome to PushAI. Let's get things set up.",
      "│",
      "◇ Choose from the available AI providers:",
      "│  Google Gemini",
      "│",
      "◇ Enter your gemini API key:",
      "│  ***************************************",
      "│",
      "◇ Which model would you like to use?",
      "│  Gemini 3.1 Flash Lite",
      "│",
      "└ Configuration complete. You're ready to go!",
    ],
  },
  {
    title: "commit",
    command: "pai commit",
    output: [
      "┌ ● GEMINI • gemini-3.1-flash-lite",
      "│",
      "◇ Ready to commit ────────────────────────────────╮",
      "│                                                 │",
      "│  refactor(auth): swap JWT for httpOnly cookies  │",
      "│                                                 │",
      "├─────────────────────────────────────────────────╯",
      "│",
      "◇ What would you like to do next?",
      "│  Commit and push changes",
      "│",
      "└ Successfully synced with the remote repository.",
    ],
  },
  {
    title: "commit",
    command: "pai commit  --dry-run",
    output: [
      "┌ ● GEMINI • gemini-3.1-flash-lite",
      "│",
      "◇ Ready to commit ────────────────────────────────╮",
      "│                                                 │",
      "│  refactor(auth): swap JWT for httpOnly cookies  │",
      "│                                                 │",
      "├─────────────────────────────────────────────────╯",
      "│",
      "└ [DRY RUN] No changes were committed or pushed.",
    ],
  },
  {
    title: "reset",
    command: "pai reset",
    output: [
      "┌  Resetting PushAI configuration",
      "│",
      "◇  Remove all PushAI configurations and API keys?",
      "│  ● Yes / ○ No",
      "│",
      "└  PushAI configuration removed successfully.",
    ],
  },
]

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
}

export function Hero() {
  const [idx, setIdx] = useState(0)
  const current = useMemo(() => demos[idx], [idx])

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % demos.length)
    }, 7000)

    return () => clearInterval(t)
  }, [])

  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-16 sm:px-6 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center"
        >
          <div className="group mx-auto flex w-fit cursor-pointer items-center gap-3 rounded-full border bg-background p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300">
            <div className="inline-flex items-center gap-3">
              <span className="size-2 animate-pulse rounded-full bg-success" />
              <span className="text-sm text-foreground">
                AI-powered git workflow
              </span>
            </div>

            <Separator orientation="vertical" className="my-auto h-4" />

            <div className="size-6 overflow-hidden rounded-full bg-background duration-500 group-hover:bg-secondary">
              <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                <span className="flex size-6">
                  <ArrowRight className="m-auto size-3" />
                </span>
                <span className="flex size-6">
                  <ArrowRight className="m-auto size-3" />
                </span>
              </div>
            </div>
          </div>

          <h1 className="mt-6 max-w-4xl text-5xl leading-[0.95] font-bold tracking-[-0.04em] sm:text-7xl lg:text-[5.5rem]">
            Ship commits at the speed of thought.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            PushAI stages your changes, writes meaningful commit messages with
            AI, and pushes — all from a single terminal command.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" onClick={() => scrollTo("install")}>
              Install {siteConfig.name} <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => scrollTo("how")}>
              How it works
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto mt-16 max-w-3xl"
        >
          <Terminal
            key={idx}
            title={`~/commands/${siteConfig.name.toLowerCase()}/${current?.title}`}
            command={current?.command}
            output={current?.output}
          />
        </motion.div>
      </div>
    </section>
  )
}
