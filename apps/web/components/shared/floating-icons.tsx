"use client"
import { motion } from "motion/react"
import {
  GitBranch,
  Terminal as TerminalIcon,
  Sparkles,
  Cloud,
  GitCommit,
  ArrowUpRight,
  GitPullRequest,
  Code2,
  Zap,
  Hash,
} from "lucide-react"

const icons = [
  { Icon: GitBranch, top: "8%", left: "6%", delay: 0 },
  { Icon: TerminalIcon, top: "14%", left: "88%", delay: 0.4 },
  { Icon: Sparkles, top: "30%", left: "14%", delay: 0.8 },
  { Icon: Cloud, top: "26%", left: "78%", delay: 1.2 },
  { Icon: GitCommit, top: "52%", left: "4%", delay: 0.2 },
  { Icon: ArrowUpRight, top: "58%", left: "92%", delay: 0.6 },
  { Icon: GitPullRequest, top: "74%", left: "10%", delay: 1.0 },
  { Icon: Code2, top: "80%", left: "84%", delay: 1.4 },
  { Icon: Zap, top: "42%", left: "94%", delay: 1.6 },
  { Icon: Hash, top: "44%", left: "2%", delay: 0.9 },
]

export const FloatingIcons = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {icons.map(({ Icon, top, left, delay }, i) => (
        <motion.div
          key={i}
          className="absolute text-foreground/15"
          style={{ top, left }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: [10, -10, 10] }}
          transition={{
            opacity: { duration: 1, delay },
            y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay },
          }}
        >
          <Icon className="size-8 sm:size-10" strokeWidth={1.5} />
        </motion.div>
      ))}
    </div>
  )
}
