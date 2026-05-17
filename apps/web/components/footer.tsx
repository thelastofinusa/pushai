import { siteConfig } from "@/config/site.config"
import Link from "next/link"

export const revalidate = 3600

async function getVersion() {
  try {
    const res = await fetch(`${siteConfig.url}/api/version`, {
      next: {
        revalidate,
      },
    })

    return (await res.json()) || "0.0.0"
  } catch {
    return "0.0.0"
  }
}

export const Footer = async () => {
  const version = await getVersion()

  return (
    <footer className="py-12">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6">
        <span className="text-sm text-muted-foreground">
          © 2026 {siteConfig.name}. All rights reserved.
        </span>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>v{version}</span>

          <span>•</span>

          <Link
            target="_blank"
            href={`https://x.com/${siteConfig.username}`}
            className="transition-colors hover:text-foreground"
          >
            {siteConfig.nickname}
          </Link>
        </div>
      </div>
    </footer>
  )
}
