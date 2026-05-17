"use client"

import { siteConfig } from "@/config/site.config"
import { imagePath } from "@typest/nextjs"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { useTheme } from "next-themes"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { BsGithub } from "react-icons/bs"
import { CgNpm } from "react-icons/cg"
import { FiMoon } from "react-icons/fi"
import { MdOutlineWbSunny } from "react-icons/md"
import { SiProducthunt } from "react-icons/si"

export const Header = () => {
  const { resolvedTheme, setTheme } = useTheme()

  const [npmDownloads, setNpmDownloads] = useState<string | null>(null)

  useEffect(() => {
    // Fetch total npm downloads from shields.io
    fetch(`https://img.shields.io/npm/dt/${siteConfig.name.toLowerCase()}.json`)
      .then((res) => res.json())
      .then((data) => setNpmDownloads(data.value))
      .catch(() => setNpmDownloads("0"))
  }, [])

  return (
    <header className="sticky top-0 left-0 z-50 w-full bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-6 sm:px-6 md:py-8">
        <Link href="/" className="flex items-center gap-3">
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

        <div className="flex items-center gap-1">
          <Link
            href={`https://www.npmjs.com/package/${siteConfig.name}`}
            target="_blank"
            className={buttonVariants({
              variant: "ghost",
            })}
          >
            <CgNpm className="size-5" />
            <span>
              {npmDownloads ?? "0"}{" "}
              <span className="sr-only md:not-sr-only">downloads</span>
            </span>
          </Link>

          <Link
            href={`https://github.com/${siteConfig.username}/${siteConfig.name}`}
            target="_blank"
            className={buttonVariants({
              variant: "ghost",
            })}
          >
            <BsGithub className="size-4" />
            <span className="sr-only md:not-sr-only">GitHub</span>
          </Link>

          <Link
            href="https://www.producthunt.com/posts/pushai"
            target="_blank"
            className={buttonVariants({
              variant: "ghost",
            })}
          >
            <SiProducthunt className="size-4" />
            <span className="sr-only md:not-sr-only">Product Hunt</span>
          </Link>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            {resolvedTheme === "dark" ? (
              <MdOutlineWbSunny className="size-4" />
            ) : (
              <FiMoon className="size-4" />
            )}
          </Button>
        </div>
      </nav>
    </header>
  )
}
