import React from "react"
import { FloatingIcons } from "@/components/shared/floating-icons"

import { Hero } from "../components/hero"
import { FinalCTA } from "../components/finalCTA"
import { Features } from "../components/features"
import { HowItWorks } from "../components/howItWorks"

export default function Page() {
  return (
    <div className="flex-1">
      <FloatingIcons />
      <Hero />
      <Features />
      <HowItWorks />
      <FinalCTA />
    </div>
  )
}
