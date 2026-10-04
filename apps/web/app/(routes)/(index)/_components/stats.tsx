"use client";

import { useSiteStats } from "@/components/providers/stats.provider";
import { Container } from "@/components/shared/container";

export const Stats = () => {
  const { stats } = useSiteStats();

  return (
    <div className="border-border border-y">
      <Container>
        <div className="grid grid-cols-3 py-5 font-mono text-[10px] sm:text-xs">
          {[
            ["npm version", stats.version],
            ["total downloads", stats.downloads],
            ["GitHub commits", stats.commits],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex min-w-0 flex-col gap-1 border-border border-r px-2 text-center last:border-r-0 sm:flex-row sm:justify-center sm:gap-3"
            >
              <span className="text-muted-foreground">{label}</span>
              <span className="truncate text-foreground" aria-live="polite">
                {value}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
};
