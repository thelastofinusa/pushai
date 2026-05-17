import { siteConfig } from "@/config/site.config"
import { imagePath } from "@typest/nextjs"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import Image from "next/image"
import Link from "next/link"
import React from "react"
import { BsGithub } from "react-icons/bs"
import { CgNpm } from "react-icons/cg"

export const Header = () => {
  return (
    <header className="sticky top-0 left-0 z-50 w-full bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-6 sm:px-6 md:py-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={imagePath("favicon-dark.svg")}
            alt={siteConfig.name}
            width={30}
            height={30}
            priority
            className="hidden dark:block"
          />
          <Image
            src={imagePath("favicon.svg")}
            alt={siteConfig.name}
            width={30}
            height={30}
            priority
            className="dark:hidden"
          />
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="https://github.com/thelastofinusa/pushai"
            target="_blank"
            className={buttonVariants({
              size: "icon-lg",
              variant: "ghost",
            })}
          >
            <BsGithub />
          </Link>
          <Link
            href="https://www.npmjs.com/package/pushai"
            target="_blank"
            className={buttonVariants({
              size: "icon-lg",
              variant: "ghost",
            })}
          >
            <CgNpm />
          </Link>
        </div>
      </nav>
    </header>
  )
}
