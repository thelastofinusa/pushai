"use client"
import { useEffect, useMemo, useState } from "react"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Terminal } from "@/components/shared/terminal"
import { siteConfig } from "@/config/site.config"
import { Separator } from "@workspace/ui/components/separator"

const demos = [
  {
    title: "config",
    command: "pai config",
    output: [
      "┌ ● PushAI Config → Set up your AI provider and model",
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
    title: "list",
    command: "pai list",
    output: [
      "┌ ● PushAI Config → Browse available providers & models",
      "│",
      "◇ Anthropic (Claude) models ──────────────────────╮",
      "│                                                 │",
      "│  claude-3-5-haiku-latest: fast • recommended    │",
      "│  claude-3-5-sonnet-latest: best quality • paid  │",
      "│  claude-3-opus-latest: highest quality • paid   │",
      "│                                                 │",
      "├─────────────────────────────────────────────────╯",
      "│",
      "└ Use `pai config -p <name> -m <model_id>` to configure.",
    ],
  },
  {
    title: "commit",
    command: "pai commit",
    output: [
      "┌ ● PushAI Commit → Google Gemini session initialized",
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
      "┌ ● PushAI Commit → Google Gemini session initialized",
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
      "┌ ● PushAI Reset → Clear saved configuration",
      "│",
      "◇ Remove all PushAI configurations and API keys?",
      "│  ● Yes / ○ No",
      "│",
      "└ PushAI configuration removed successfully.",
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
  const [version, setVersion] = useState("0.0.0")

  useEffect(() => {
    fetch("/api/version")
      .then((res) => res.json())
      .then((data) => setVersion(data))
      .catch(() => setVersion("0.0.0"))
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % demos.length)
    }, 7000)

    return () => clearInterval(t)
  }, [])

  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-4 pt-10 pb-16 sm:px-6 sm:pt-20 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center"
        >
          <div className="group mx-auto inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border bg-background p-1 pr-4 shadow-md shadow-zinc-950/5 transition-colors duration-300">
            <div className="flex h-5 items-center justify-center overflow-hidden rounded-full bg-secondary px-2 sm:h-6">
              <span className="text-xs font-medium sm:text-sm">v{version}</span>
            </div>
            <Separator orientation="vertical" className="my-auto h-4" />
            <span className="text-xs text-foreground sm:text-sm">
              AI-powered git workflow
            </span>
          </div>

          <h1 className="mt-4 max-w-4xl text-5xl leading-[0.95] font-bold tracking-[-0.04em] sm:mt-6 sm:text-7xl lg:text-[5.5rem]">
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
