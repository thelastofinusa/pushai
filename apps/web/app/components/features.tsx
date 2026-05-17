"use client"
import { Zap, Lock, Code2, GitBranch, Sparkles, Cloud } from "lucide-react"
import { motion } from "motion/react"

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Generate commits in seconds with AI-powered insights into your code changes.",
  },
  {
    icon: Lock,
    title: "Fully Private",
    description: "Bring your own API key. Your code never leaves your machine.",
  },
  {
    icon: Code2,
    title: "Works Everywhere",
    description:
      "Use any Git repository. No restrictions on language or framework.",
  },
  {
    icon: GitBranch,
    title: "Smart Commits",
    description:
      "AI understands context and generates meaningful, conventional commit messages.",
  },
  {
    icon: Sparkles,
    title: "Highly Customizable",
    description: "Choose your AI provider, model, and commit message format.",
  },
  {
    icon: Cloud,
    title: "Open Source",
    description:
      "MIT licensed and transparent. Contribute and extend PushAI however you want.",
  },
]

export const Features = () => {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mb-16 text-center"
      >
        <h2 className="mb-4 text-4xl font-bold sm:text-5xl">
          Everything you need
        </h2>
        <p className="text-muted-foreground">
          Built for developers who want to ship faster without sacrificing code
          quality.
        </p>
      </motion.div>

      <div className="relative mx-auto grid divide-x divide-y overflow-hidden rounded-xl border bg-background/80 shadow-2xl shadow-black/10 backdrop-blur sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, idx) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="p-6 md:p-8 lg:p-12"
            >
              <div className="mb-2 flex items-center gap-2 md:mb-4">
                <Icon className="size-4" />
                <h3 className="text-sm font-medium">{feature.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
