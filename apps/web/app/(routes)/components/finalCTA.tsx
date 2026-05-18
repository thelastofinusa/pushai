"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { CheckCheck, Copy, Sparkles } from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { SiBun, SiNpm, SiPnpm, SiYarn } from "react-icons/si"

const TypewriterCommand = ({ text }: { text: string }) => {
  const [displayed, setDisplayed] = useState("")

  useEffect(() => {
    let index = 0

    setDisplayed("")

    const interval = setInterval(() => {
      index++

      setDisplayed(text.slice(0, index))

      if (index >= text.length) {
        clearInterval(interval)
      }
    }, 35)

    return () => clearInterval(interval)
  }, [text])

  return (
    <span>
      {displayed}

      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="ml-0.5"
      >
        █
      </motion.span>
    </span>
  )
}

export function FinalCTA() {
  const [copied, setCopied] = useState(false)
  const installCommands = {
    npm: "npm install -g pushai",
    pnpm: "pnpm add -g pushai",
    yarn: "yarn global add pushai",
    bun: "bun add -g pushai",
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-24 sm:px-6">
      <motion.div
        id="install"
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

          <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Stop writing commit messages.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Install PushAI in your next terminal session and let AI handle your
            commits.
          </p>

          <Tabs
            defaultValue="npm"
            className="mx-auto mt-10 w-full items-center sm:max-w-sm"
          >
            <TabsList>
              <TabsTrigger value="npm">
                <SiNpm className="size-3.5 sm:size-4" />
                <span className="text-xs">npm</span>
              </TabsTrigger>
              <TabsTrigger value="pnpm">
                <SiPnpm className="size-3 sm:size-3.5" />
                <span className="text-xs">pnpm</span>
              </TabsTrigger>
              <TabsTrigger value="yarn">
                <SiYarn className="size-3.5 sm:size-4" />
                <span className="text-xs">yarn</span>
              </TabsTrigger>
              <TabsTrigger value="bun">
                <SiBun className="size-3.5 sm:size-4" />
                <span className="text-xs">bun</span>
              </TabsTrigger>
            </TabsList>

            {Object.entries(installCommands).map(([manager, command]) => (
              <TabsContent
                key={manager}
                value={manager}
                className="w-full overflow-hidden rounded-lg border bg-background shadow-2xl shadow-black/5 backdrop-blur"
              >
                <div className="flex items-center gap-1 border-b px-3 py-2 sm:px-4">
                  <span className="size-2 rounded-full bg-[#ff5f57]" />
                  <span className="size-2 rounded-full bg-[#febc2e]" />
                  <span className="size-2 rounded-full bg-[#28c840]" />

                  <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                    ~/installation
                  </span>
                </div>

                <div className="flex items-center gap-3 px-4 py-3 font-mono text-[13px] leading-relaxed">
                  <span className="mt-px text-success">$</span>

                  <code>
                    <TypewriterCommand text={command} />
                  </code>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(command)
                      setCopied(true)

                      setTimeout(() => setCopied(false), 1500)
                    }}
                    className="ml-auto text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Copy install command"
                  >
                    {copied ? (
                      <CheckCheck className="size-3.5 text-success" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </motion.div>
    </section>
  )
}
