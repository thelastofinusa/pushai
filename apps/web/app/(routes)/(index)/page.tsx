import { FloatingIcons } from "@/components/shared/floating-icons";
import { Features } from "../components/features";
import { FinalCTA } from "../components/finalCTA";
import { Hero } from "../components/hero";
import { HowItWorks } from "../components/howItWorks";

export default function Page() {
  return (
    <div className="flex-1">
      <FloatingIcons />
      <Hero />
      <Features />
      <HowItWorks />
      <FinalCTA />
    </div>
  );
}
