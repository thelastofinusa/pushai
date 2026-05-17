"use client"
import { motion } from "motion/react"
import { Check } from "lucide-react"

const steps = [
  {
    cmd: "pai config",
    title: "Configure a provider",
    desc: "Pick from available provider, drop in your API key, and choose a model. One interactive prompt.",
  },
  {
    cmd: "pai commit",
    title: "Commit and push",
    desc: "PushAI drafts a message, shows it in a confirmation box, then commits and pushes in one go.",
  },
  {
    cmd: "pai reset",
    title: "Reset anytime",
    desc: "Rotate keys or start fresh — wipe all PushAI configuration with a single confirmation.",
  },
]

export const HowItWorks = () => {
  return (
    <section id="how" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-lg text-center">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          How it works
        </p>
        <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Three steps to your first AI commit.
        </h2>
      </div>

      <div className="mt-14 grid divide-y divide-border rounded-xl border bg-linear-to-b from-transparent via-secondary/10 to-secondary/30 shadow-2xl shadow-black/10 backdrop-blur-md lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        {steps.map((s, i) => (
          <motion.div
            key={s.cmd}
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

                <span className="ml-2 font-mono text-xs text-muted-foreground">
                  ~/pushai
                </span>
              </div>

              {/* terminal body */}
              <div className="space-y-3 px-4 py-3 font-mono text-[13px] leading-relaxed">
                <div className="flex items-center gap-2">
                  <span className="text-success">%</span>

                  <span className="text-foreground">{s.cmd}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        {[
          "Open source",
          "MIT licensed",
          "Bring your own key",
          "Add custom model ID",
          // "Works offline (Ollama)",
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
