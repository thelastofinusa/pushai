"use client"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"

import { Terminal } from "@/components/terminal"
import { siteConfig } from "@/config/site.config"
import { Button } from "@workspace/ui/components/button"
import { FloatingIcons } from "@/components/floating-icons"

export const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      <FloatingIcons />
      <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center"
        >
          {/* <div className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
            <span>Home</span>
            <ChevronRight className="size-3" />
            <span className="text-foreground">CLI</span>
          </div> */}

          <h1 className="mt-6 max-w-4xl text-5xl leading-[0.95] font-bold tracking-[-0.04em] sm:text-7xl lg:text-[5.5rem]">
            {siteConfig.slogan}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {siteConfig.description}
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg">
              Install PushAI <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline">
              {/* <Github className="size-4" /> */}
              View on GitHub
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-sm">
            <Stat value="3" label="providers" />
            <Stat value="1" label="command to ship" />
            <Stat value="0" label="config required" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto mt-16 max-w-3xl"
        >
          <div className="absolute -inset-4 rounded-3xl bg-linear-to-b from-foreground/5 to-transparent blur-2xl" />
          <Terminal
            title="~/projects/pushai"
            content={`$ pnpm dlx pushai commit

┌ GEMINI • gemini-3.1-flash-lite
│
◇ Commit message preview ───────────────────────────────╮
│                                                       │
│  feat(providers): add streaming support for Gemini    │
│                                                       │
├───────────────────────────────────────────────────────╯
│
◆ Commit and push changes
│
└ Successfully synced with the remote repository.`}
          />
        </motion.div>
      </div>
    </section>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="font-semibold text-foreground">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  )
}
