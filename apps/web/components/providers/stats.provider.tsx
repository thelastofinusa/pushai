"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { getFn } from "@/lib/utils";

type SiteStats = {
  version: string;
  downloads: string;
  commits: string;
};

type SiteStatsContextValue = {
  stats: SiteStats;
  loading: boolean;
};

const initialStats: SiteStats = {
  version: "0.0.0",
  downloads: "0",
  commits: "0",
};

const SiteStatsContext = createContext<SiteStatsContextValue | null>(null);

export function StatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getFn("/api/version")
        .then((res) => res.json())
        .then((data) =>
          typeof data === "string" ? `v${data}` : initialStats.version,
        )
        .catch(() => "—"),

      getFn("/api/downloads")
        .then((res) => res.json())
        .then((data) => String(data))
        .catch(() => initialStats.downloads),

      getFn("/api/commits")
        .then((res) => res.json())
        .then((data) => String(data))
        .catch(() => initialStats.commits),
    ]).then(([version, downloads, commits]) => {
      setStats({
        version,
        downloads,
        commits,
      });

      setLoading(false);
    });
  }, []);

  return (
    <SiteStatsContext.Provider value={{ stats, loading }}>
      {children}
    </SiteStatsContext.Provider>
  );
}

export function useSiteStats() {
  const context = useContext(SiteStatsContext);

  if (!context) {
    throw new Error("useSiteStats must be used within a SiteStatsProvider");
  }

  return context;
}
