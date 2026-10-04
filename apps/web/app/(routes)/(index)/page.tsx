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
      <div className="bg-card">
        <Stats />
      </div>
      <Workflow />
      <div className="bg-linear-to-b from-card via-card/60 to-transparent">
        <Features />
      </div>
      <Providers />
      <div className="bg-linear-to-b from-card via-card/60 to-transparent">
        <Commands />
      </div>
      <Trust />
      <div className="bg-linear-to-b from-card via-card/60 to-transparent">
        <FAQs />
      </div>
    </div>
  );
}
