/* eslint-disable @next/next/no-img-element */
"use client"

import { siteConfig } from "@/config/site.config"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

export const Footer = () => {
  const [version, setVersion] = useState("0.0.0")
  const [mounted, setMounted] = useState(false)

  const { resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)

    fetch("/api/version")
      .then((res) => res.json())
      .then((data) => setVersion(data))
      .catch(() => setVersion("0.0.0"))
  }, [])

  const theme = mounted ? resolvedTheme : "light"

  const badgeSrc = `https://api.producthunt.com/widgets/embed-image/v1/product_review.svg?product_id=1227466&theme=${theme}`

  return (
    <footer className="py-12">
      <div className="mx-auto flex max-w-[1320px] flex-col items-center justify-between gap-6 px-6 md:flex-row md:items-center">
        <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
          <span className="text-sm text-muted-foreground">
            © 2026 {siteConfig.name}. All rights reserved.
          </span>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {siteConfig.name}{" "}
              <span className="text-foreground">v{version}</span>
            </span>

            <span>•</span>

            <Link
              target="_blank"
              href={`https://x.com/${siteConfig.username}`}
              className="transition-colors hover:text-foreground hover:underline"
            >
              {siteConfig.nickname}
            </Link>
          </div>
        </div>

        <a
          href="https://www.producthunt.com/products/pushai"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-opacity hover:opacity-90"
        >
          <img
            src={badgeSrc}
            alt="PushAI on Product Hunt"
            width={200}
            height={50}
            className="h-[50px] w-[200px]"
          />
        </a>
      </div>
    </footer>
  )
}
