"use client";

import Link from "next/link";
import { useState } from "react";
import { SiNpm } from "react-icons/si";
import { TbMenu, TbX } from "react-icons/tb";
import { VscGithubInverted } from "react-icons/vsc";
import { siteConfig } from "@/config/site.config";
import { IconSwap, IconSwapItem } from "../ui/chanhdai/icon-swap";
import { Button, buttonVariants } from "../ui/shadcn/button";
import { Separator } from "../ui/shadcn/separator";
import { Container } from "./container";
import { ThemeToggle } from "./theme-toggle";

export const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <header className="sticky top-0 left-0 z-50 w-full bg-background/60 backdrop-blur-md">
      <Container className="py-4">
        <nav className="flex items-center justify-between">
          <div className="flex h-9 items-center rounded-full bg-secondary/60 px-0.5 md:-ml-3.75 md:bg-transparent">
            <Link
              href="/"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
              })}
            >
              <span>{siteConfig.name}</span>
            </Link>
          </div>

          <div className="-mr-3.5 hidden items-center gap-px md:flex">
            <div className="mr-6 flex h-9 items-center rounded-full px-0.5">
              <Button variant="ghost" size="sm">
                <span>Docs</span>
              </Button>
              <Button variant="ghost" size="sm">
                <span>Changelog</span>
              </Button>
              <Button variant="ghost" size="sm">
                <span>Pricing</span>
              </Button>
            </div>

            <div className="flex h-9 items-center rounded-full px-0.5">
              <Button variant="ghost" size="icon-sm">
                <VscGithubInverted />
              </Button>
              <Button variant="ghost" size="icon-sm">
                <SiNpm className="size-3.5!" />
              </Button>
            </div>

            <Separator orientation="vertical" className="mx-2 my-auto h-3" />

            <div className="flex h-9 items-center rounded-full px-0.5">
              <ThemeToggle size="icon-sm" variant="ghost" />
            </div>
          </div>

          <div className="flex items-center gap-2 md:-mr-3.5 md:hidden">
            <div className="flex h-9 items-center rounded-full bg-secondary/60 px-0.5 dark:bg-secondary/20">
              <ThemeToggle size="icon-sm" variant="ghost" />
            </div>

            <div className="flex h-9 items-center rounded-full bg-secondary/60 px-0.5 dark:bg-secondary/20">
              <Button variant="ghost" size="icon-sm">
                <VscGithubInverted />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setOpenMenu((prev) => !prev)}
              >
                <IconSwap>
                  <IconSwapItem key={String(openMenu)}>
                    {openMenu ? (
                      <TbX aria-hidden="true" />
                    ) : (
                      <TbMenu aria-hidden="true" />
                    )}
                  </IconSwapItem>
                </IconSwap>
              </Button>
            </div>
          </div>
        </nav>
      </Container>
    </header>
  );
};
