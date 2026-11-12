import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  Changelog,
  defineConfig,
  Embedding,
  Feedback,
  McpSource,
  Retriever,
} from "vocs/config";
import pkg from "../../packages/cli/package.json" with { type: "json" };

// ---------------------------------------------------------------------------
// npm stats: version + downloads, cached for 1 hour
// ---------------------------------------------------------------------------

type NpmStats = {
  version: string;
  weeklyDownloads: number | null;
  monthlyDownloads: number | null;
};

type CacheEntry = { fetchedAt: number; data: NpmStats };

const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_FILE = join(
  import.meta.dirname,
  "node_modules/.cache/npm-stats-pushai.json",
);

async function fetchNpmStats(packageName: string): Promise<NpmStats> {
  const [versionRes, weeklyRes, monthlyRes] = await Promise.all([
    fetch(`https://registry.npmjs.org/${packageName}/latest`),
    fetch(`https://api.npmjs.org/downloads/point/last-week/${packageName}`),
    fetch(`https://api.npmjs.org/downloads/point/last-month/${packageName}`),
  ]);

  if (!versionRes.ok || !weeklyRes.ok || !monthlyRes.ok) {
    throw new Error(
      `npm API returned ${versionRes.status}/${weeklyRes.status}/${monthlyRes.status}`,
    );
  }

  const [versionData, weeklyData, monthlyData] = await Promise.all([
    versionRes.json(),
    weeklyRes.json(),
    monthlyRes.json(),
  ]);

  return {
    version: versionData.version,
    weeklyDownloads: weeklyData.downloads ?? null,
    monthlyDownloads: monthlyData.downloads ?? null,
  };
}

async function getNpmStats(packageName: string): Promise<NpmStats> {
  // 1. Fresh cache
  if (existsSync(CACHE_FILE)) {
    try {
      const cached: CacheEntry = JSON.parse(readFileSync(CACHE_FILE, "utf8"));
      if (Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.data;
    } catch {
      // corrupt cache — fall through
    }
  }

  // 2. Fetch and re-write cache
  try {
    const data = await fetchNpmStats(packageName);
    mkdirSync(dirname(CACHE_FILE), { recursive: true });
    writeFileSync(
      CACHE_FILE,
      JSON.stringify({ fetchedAt: Date.now(), data } satisfies CacheEntry),
    );
    return data;
  } catch (error) {
    console.warn("[vocs.config] Failed to fetch npm stats:", error);

    // 3. Stale cache as last resort
    if (existsSync(CACHE_FILE)) {
      try {
        const cached: CacheEntry = JSON.parse(readFileSync(CACHE_FILE, "utf8"));
        console.warn("[vocs.config] Using stale cache.");
        return cached.data;
      } catch {
        // ignore
      }
    }

    // 4. Hard fallback: local package.json, no download count
    return {
      version: pkg.version,
      weeklyDownloads: null,
      monthlyDownloads: null,
    };
  }
}

function formatCount(n: number | null): string | null {
  if (n == null) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString("en-US");
}

const stats = await getNpmStats("pushai");
const monthlyLabel = formatCount(stats.monthlyDownloads);
// Swap the line below in if you'd rather show weekly:
// const monthlyLabel = formatCount(stats.weeklyDownloads);

const versionLabel = `v${stats.version}${
  monthlyLabel ? ` • ${monthlyLabel}/mo` : ""
}`;

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export default defineConfig({
  title: "PushAI – Your Git workflow, quietly smarter.",
  titleTemplate: "%s – PushAI",

  iconUrl: {
    light: "/icon-light.svg",
    dark: "/icon-dark.svg",
  },

  logoUrl: {
    light: "/logo-tight-light.svg",
    dark: "/logo-tight-dark.svg",
  },

  socials: [
    {
      icon: "github",
      link: "https://github.com/thelastofinusa/pushai",
    },
  ],
  sidebar: [
    {
      text: "Introduction",
      collapsed: false,
      items: [
        { text: "What is PushAI?", link: "/introduction/what-is-pushai" },
        { text: "Getting Started", link: "/introduction/getting-started" },
        { text: "Setup Wizard", link: "/introduction/setup-wizard" },
      ],
    },
    {
      text: "Commands",
      collapsed: false,
      items: [
        { text: "Generate commit", link: "/commands/commit" },
        { text: "Push changes", link: "/commands/push" },
        { text: "Switch provider", link: "/commands/switch" },
        { text: "View configuration", link: "/commands/peak" },
        { text: "Reset configuration", link: "/commands/reset" },
        { text: "Check updates", link: "/commands/update" },
      ],
    },
    {
      text: "AI Providers",
      collapsed: false,
      items: [
        { text: "Bring Your Own Key", link: "/providers/byok" },
        { text: "Local models (Ollama)", link: "/providers/ollama" },
        { text: "Cloud Hosted", link: "/providers/cloud" },
      ],
    },
    {
      text: "Reference",
      collapsed: false,
      items: [
        { text: "CLI reference", link: "/reference/cli" },
        { text: "Configuration", link: "/reference/config" },
      ],
    },
  ],
  mcp: {
    enabled: true,
    sources: [
      McpSource.github({
        name: "pushai",
        repo: "thelastofinusa/pushai",
        paths: ["packages"],
      }),
    ],
  },
  ogImageUrl: (path, { baseUrl }) => `${baseUrl ?? ""}/og-image.webp`,
  ai: {
    retriever: process.env.CLOUDFLARE_API_TOKEN
      ? Retriever.local({ embedding: Embedding.cloudflare() })
      : undefined,
  },
  baseUrl:
    process.env.VERCEL_ENV === "production"
      ? "https://pushai.vercel.app"
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://pushai.vercel.app",
  cacheDir: ".vocs/cache",
  changelog: Changelog.github({ repo: "thelastofinusa/pushai" }),
  checkDeadlinks: true,
  feedback: Feedback.from({
    type: "custom",
    async submit(data) {
      const webhookUrl = process.env.DISCORD_PUSHAI_WEBHOOK_URL;

      if (!webhookUrl) {
        console.error(
          "❌ DISCORD_PUSHAI_WEBHOOK_URL is not defined in environment variables!",
        );
        return;
      }

      const isHelpful = data.helpful;
      const category = data.category ? ` [${data.category.toUpperCase()}]` : "";
      const timestamp = data.timestamp
        ? new Date(data.timestamp).toISOString()
        : new Date().toISOString();

      try {
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            embeds: [
              {
                title: `📝 PushAI Docs Feedback${category}`,
                description: data.message || "_No written comment provided._",
                color: isHelpful ? 3066993 : 15158332,
                fields: [
                  {
                    name: "Rating",
                    value: isHelpful ? "👍 Helpful" : "👎 Needs Work",
                    inline: true,
                  },
                  {
                    name: "Page URL",
                    value: data.pageUrl
                      ? `[View Page](${data.pageUrl})`
                      : "N/A",
                    inline: true,
                  },
                ],
                footer: {
                  text: "PushAI Documentation Feedback Bot",
                },
                timestamp: timestamp,
              },
            ],
          }),
        });

        if (!res.ok) {
          console.error(`❌ Webhook error ${res.status}:`, await res.text());
        } else {
          console.log("✅ Feedback successfully dispatched to Discord!");
        }
      } catch (err) {
        console.error("❌ Error sending feedback to Discord:", err);
      }
    },
  }),

  description:
    "An AI Git assistant for your terminal. Stage your changes, generate a Conventional Commit, and push — all from one command.",

  editLink: {
    link: "https://github.com/thelastofinusa/pushai/edit/main/apps/docs/src/pages/:path",
  },
  topNav: [
    {
      text: "Documentation",
      link: "/introduction/getting-started",
      match: (path) =>
        Boolean(
          path?.startsWith("/introduction") ||
            path?.startsWith("/commands") ||
            path?.startsWith("/providers") ||
            path?.startsWith("/reference"),
        ),
    },
    {
      text: versionLabel,
      items: [
        {
          text: "NPM",
          link: "https://www.npmjs.com/package/pushai",
        },
      ],
    },
  ],
});
