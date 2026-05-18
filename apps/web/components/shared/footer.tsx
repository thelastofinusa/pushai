/* eslint-disable @next/next/no-img-element */
"use client"

import { siteConfig } from "@/config/site.config"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

export const Footer = () => {
  const [version, setVersion] = useState("0.0.0")

  useEffect(() => {
    fetch("/api/version")
      .then((res) => res.json())
      .then((data) => setVersion(data))
      .catch(() => setVersion("0.0.0"))
  }, [])

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
          href="https://www.producthunt.com/products/pushai?embed=true&amp;utm_source=badge-featured&amp;utm_medium=badge&amp;utm_campaign=badge-pushai"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-opacity hover:opacity-90"
        >
          <img
            alt="PushAI - Ship commits at the speed of thought. | Product Hunt"
            width={210}
            height={45}
            className="dark:hidden"
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1149282&amp;theme=light&amp;t=1779119503029"
          />
          <img
            alt="PushAI - Ship commits at the speed of thought. | Product Hunt"
            width={210}
            height={45}
            className="hidden dark:block"
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1149282&amp;theme=dark&amp;t=1779119503029"
          />
        </a>
      </div>
    </footer>
  )
}
