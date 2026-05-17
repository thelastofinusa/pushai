import React from "react"
import { Hero } from "./components/hero"
import { HowItWorks } from "./components/howItWorks"
import { FloatingIcons } from "@/components/floating-icons"
import { FinalCTA } from "./components/finalCTA"
import { Features } from "./components/features"
import { CommandsSection } from "./components/commands"

export default function Page() {
  return (
    <div className="flex-1">
      <FloatingIcons />
      <Hero />
      <Features />
      <HowItWorks />
      <CommandsSection />
      <FinalCTA />
    </div>
  )
}
