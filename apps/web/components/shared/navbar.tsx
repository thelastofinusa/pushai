"use client";

import Link from "next/link";
import { SiNpm } from "react-icons/si";
import { VscGithubInverted } from "react-icons/vsc";
import { Button } from "../ui/shadcn/button";
import { Separator } from "../ui/shadcn/separator";
import { Container } from "./container";
import { LogoSVG } from "./logo-svg";
import { ThemeToggle } from "./theme-toggle";

export const Navbar = () => {
  return (
    <header className="sticky top-0 left-0 z-50 w-full bg-background/60 backdrop-blur-md">
      <Container className="py-4">
        <nav className="flex items-center justify-between">
          <Link href="/">
            <LogoSVG className="h-auto! w-12!" />
          </Link>

          <div className="-mr-3.5 hidden items-center gap-px md:flex">
            <div className="mr-6 hidden h-9 items-center rounded-full px-0.5">
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
              <Button
                variant="ghost"
                size="icon-sm"
                nativeButton={false}
                render={
                  <a
                    href="https://github.com/thelastofinusa/pushai"
                    target="_blank"
                    rel="noopener"
                  />
                }
              >
                <VscGithubInverted />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                nativeButton={false}
                render={
                  <a
                    href="https://www.npmjs.com/package/pushai"
                    target="_blank"
                    rel="noopener"
                  />
                }
              >
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
              <Button
                variant="ghost"
                size="icon-sm"
                nativeButton={false}
                render={
                  <a
                    href="https://github.com/thelastofinusa/pushai"
                    target="_blank"
                    rel="noopener"
                  />
                }
              >
                <VscGithubInverted />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                nativeButton={false}
                render={
                  <a
                    href="https://www.npmjs.com/package/pushai"
                    target="_blank"
                    rel="noopener"
                  />
                }
              >
                <SiNpm className="size-3.5!" />
              </Button>
              {/* <Button
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
              </Button> */}
            </div>
          </div>
        </nav>
      </Container>
    </header>
  );
};
