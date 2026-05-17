"use client"

import { siteConfig } from "@/config/site.config"
import Link from "next/link"
import { useEffect, useState } from "react"

export const Footer = () => {
  const [version, setVersion] = useState("0.0.0")

  useEffect(() => {
    fetch("/api/version", {
      cache: "force-cache",
    })
      .then((res) => res.json())
      .then((data) => setVersion(data))
      .catch(() => setVersion("0.0.0"))
  }, [])

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
