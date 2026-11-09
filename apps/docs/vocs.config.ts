import {
  Changelog,
  defineConfig,
  Embedding,
  Feedback,
  McpSource,
  Retriever,
  Twoslash,
} from "vocs/config";
import pkg from "../../packages/cli/package.json";

const { version } = pkg;

export default defineConfig({
  title: "PushAI",
  titleTemplate: "%s – PushAI",
  description:
    "An AI Git assistant for your terminal. Staged diffs → Conventional Commits → push, from one command.",

  iconUrl: {
    light: "/icon-light.svg",
    dark: "/icon-dark.svg",
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
      text: "Guides",
      collapsed: false,
      items: [
        { text: "How It Works", link: "/guides/how-it-works" },
        { text: "CLI", link: "/reference/cli" },
        {
          text: "Commands",
          collapsed: false,
          items: [
            { text: "Generate commit", link: "/guides/commands/commit" },
            { text: "Push changes", link: "/guides/commands/push" },
            { text: "Switch provider", link: "/guides/commands/switch" },
            { text: "View configuration", link: "/guides/commands/peek" },
            { text: "Reset configuration", link: "/guides/commands/reset" },
            { text: "Check updates", link: "/guides/commands/update" },
          ],
        },
        {
          text: "AI Providers",
          collapsed: false,
          items: [
            {
              text: "Bring Your Own Key (BYOK)",
              link: "/guides/providers/byok",
            },
            { text: "Local Models (Ollama)", link: "/guides/providers/ollama" },
            { text: "Cloud Hosted", link: "/guides/providers/cloud" },
          ],
        },
      ],
    },
    {
      text: "Reference",
      collapsed: false,
      items: [{ text: "Configuration options", link: "/reference/config" }],
    },
  ],

  mcp: {
    enabled: true,
    sources: [
      McpSource.github({
        name: "pushai",
        repo: "thelastofinusa/pushai",
        paths: ["packages", "apps"],
      }),
    ],
  },

  ogImageUrl: (path, { baseUrl }) => `${baseUrl ?? ""}/og-image.webp`,

  twoslash: {
    transformers: [
      Twoslash.experimental_rust({
        cargoToml: "./Cargo.toml",
        cacheOnly: true,
      }),
    ],
  },

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

  editLink: {
    link: "https://github.com/thelastofinusa/pushai/edit/main/apps/docs/src/pages/:path",
  },

  topNav: [
    {
      text: "Guides & API",
      link: "/introduction/getting-started",
      match: (path) =>
        Boolean(
          path?.startsWith("/introduction") ||
            path?.startsWith("/guides") ||
            path?.startsWith("/reference") ||
            path === "/configuration" ||
            path === "/how-it-works" ||
            path === "/cli-reference",
        ),
    },
    {
      text: `v${version}`,
      items: [
        {
          text: "NPM",
          link: "https://www.npmjs.com/package/pushai",
        },
      ],
    },
  ],
});
