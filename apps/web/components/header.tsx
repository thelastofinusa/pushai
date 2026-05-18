"use client"

import { Separator } from "@workspace/ui/components/separator"
import { siteConfig } from "@/config/site.config"
import { imagePath } from "@typest/nextjs"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { Route } from "next"
import { useTheme } from "next-themes"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { CgNpm } from "react-icons/cg"
import { FiMoon } from "react-icons/fi"
import { IoIosGitCommit } from "react-icons/io"
import { MdOutlineWbSunny } from "react-icons/md"
import { FaProductHunt } from "react-icons/fa6"

type Stats = {
  downloads: string
  commits: number
}

export const Header = () => {
  const { resolvedTheme, setTheme } = useTheme()

  const [mounted, setMounted] = useState(false)

  const [stats, setStats] = useState<Stats>({
    downloads: "0",
    commits: 0,
  })

  useEffect(() => {
    setMounted(true)

    async function loadStats() {
      try {
        const [commitsRes, downloadsRes] = await Promise.all([
          fetch("/api/commits"),
          fetch("/api/downloads"),
        ])

        const [commitsData, downloadsData] = await Promise.all([
          commitsRes.json(),
          downloadsRes.json(),
        ])

        setStats({
          downloads: downloadsData || "0",
          commits: commitsData || 0,
        })
      } catch {
        setStats({
          downloads: "0",
          commits: 0,
        })
      }
    }

    loadStats()
  }, [])

  const links = useMemo(
    () => [
      {
        href: `https://www.npmjs.com/package/${siteConfig.name.toLowerCase()}`,
        icon: CgNpm,
        label: "Downloads",
        value: stats.downloads,
      },

      {
        href: `https://github.com/${siteConfig.username}/${siteConfig.name.toLowerCase()}`,
        icon: IoIosGitCommit,
        label: "Commits",
        value: stats.commits,
      },
    ],
    [stats]
  )

  return (
    <header className="pointer-events-none sticky top-0 left-0 z-50 w-full dark:mix-blend-difference">
      <nav className="mx-auto flex w-full max-w-[1320px] items-center justify-between gap-6 px-4 py-6 sm:px-6 md:py-8">
        <Link href="/" className="pointer-events-auto flex items-center gap-3">
          <Image
            src={imagePath("favicon-dark.png")}
            alt={siteConfig.name}
            width={30}
            height={30}
            priority
            className="hidden dark:block"
          />

          <Image
            src={imagePath("favicon.png")}
            alt={siteConfig.name}
            width={30}
            height={30}
            priority
            className="dark:hidden"
          />
        </Link>

        <div className="flex items-center">
          {links.map((link) => {
            const Icon = link.icon

            return (
              <Link
                key={link.label}
                href={link.href as Route}
                target="_blank"
                className={buttonVariants({
                  variant: "ghost",
                  className: "pointer-events-auto",
                })}
              >
                <Icon className="size-5" />

                <span>
                  {link.value !== null && <>{link.value} </>}
                  <span className="sr-only md:not-sr-only">{link.label}</span>
                </span>
              </Link>
            )
          })}

          <Separator
            orientation="vertical"
            className="mx-2 my-auto h-4! sm:mx-4"
          />

          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            className="pointer-events-auto"
          >
            {mounted ? (
              resolvedTheme === "dark" ? (
                <MdOutlineWbSunny className="size-4" />
              ) : (
                <FiMoon className="size-4" />
              )
            ) : (
              <div className="size-4" />
            )}
          </Button>
        </div>
      </nav>
    </header>
  )
}
