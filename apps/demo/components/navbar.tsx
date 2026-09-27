import Link from "next/link";
import { SiNpm } from "react-icons/si";
import { TbMenu } from "react-icons/tb";
import { VscGithubInverted } from "react-icons/vsc";
import { Moon } from "reicon-react";
import { Button, buttonVariants } from "./reusable/shadcn/button";
import { Separator } from "./reusable/shadcn/separator";
import { containerVariants } from "./reusable/shared/container";

export const Navbar = () => {
  return (
    <header className="sticky top-0 left-0 z-50 w-full bg-background/60 backdrop-blur-md">
      <nav
        className={containerVariants({
          className: "flex items-center justify-between py-4",
        })}
      >
        <div className="flex h-9 items-center rounded-full bg-secondary/20 px-0.5 md:-ml-3.75 md:bg-transparent">
          <Link
            href="/"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
            })}
          >
            <span>PushAI</span>
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
            <Button variant="ghost" size="icon-sm">
              <Moon />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 md:-mr-3.5 md:hidden">
          <div className="flex h-9 items-center rounded-full bg-secondary/20 px-0.5">
            <Button variant="ghost" size="icon-sm">
              <Moon />
            </Button>
          </div>

          <div className="flex h-9 items-center rounded-full bg-secondary/20 px-0.5">
            <Button variant="ghost" size="icon-sm">
              <VscGithubInverted />
            </Button>
            <Button variant="ghost" size="icon-sm">
              <TbMenu />
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
};
