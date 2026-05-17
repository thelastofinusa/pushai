import { siteConfig } from "@/config/site.config"
import Link from "next/link"
import React from "react"

export const Footer = () => {
  return (
    <footer className="py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap justify-between gap-6">
          <span className="order-last block text-center text-sm md:order-first">
            © {2026} {siteConfig.name}, All rights reserved
          </span>
          <span className="order-first text-sm md:order-last">
            Made with ❤️ by{" "}
            <Link
              target="_blank"
              href={`https://x.com/${siteConfig.username}`}
              className="hover:underline"
            >
              {siteConfig.nickname}
            </Link>
          </span>
        </div>
      </div>
    </footer>
  )
}
