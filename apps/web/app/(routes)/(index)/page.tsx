import { Commands } from "./_components/commands";
import { FAQs } from "./_components/faqs";
import { Features } from "./_components/features";
import { HomeHero } from "./_components/hero";
import { Providers } from "./_components/providers";
import { Stats } from "./_components/stats";
import { Trust } from "./_components/trust";
import { Workflow } from "./_components/workflow";

export default function Home() {
  return (
    <div className="flex-1 overflow-x-clip">
      <HomeHero />
      <Stats />
      <Workflow />
      <Features />
      <Providers />
      <Commands />
      <Trust />
      <FAQs />
    </div>
  );
}
