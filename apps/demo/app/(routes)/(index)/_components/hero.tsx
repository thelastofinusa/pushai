"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiTerminal } from "react-icons/fi";
import { Copy3 } from "reicon-react";
import { Container } from "@/components/shared/container";
import { TerminalWindow } from "@/components/shared/primitives";
import { Button } from "@/components/ui/shadcn/button";
import { Separator } from "@/components/ui/shadcn/separator";
import { siteConfig } from "@/config/site.config";

export const HomeHero = () => {
  const [version, setVersion] = useState("0.0.0");

  useEffect(() => {
    fetch("/api/version")
      .then((res) => res.json())
      .then((data) => setVersion(data))
      .catch(() => setVersion("0.0.0"));
  }, []);

  return (
    <div className="flex-1">
      <Container className="py-12 md:py-16 lg:py-24">
        <div className="flex flex-col gap-4">
          <div className="inline-flex w-max cursor-pointer items-center gap-2 rounded-full border bg-card p-1 pr-4">
            <div className="flex h-5 items-center justify-center overflow-hidden rounded-full bg-secondary px-2">
              <span className="font-medium font-mono text-[11px]">
                v{version}
              </span>
            </div>
            <Separator orientation="vertical" className="my-auto h-4" />
            <span className="font-mono text-[11px] text-foreground">
              {siteConfig.slogan}
            </span>
          </div>

          <h1 className="flex flex-col font-normal font-serif text-4xl capitalize sm:text-5xl md:text-6xl">
            Your Git workflow, <br />
            <span className="text-primary">quietly smarter.</span>
          </h1>
          <p className="mb-4 max-w-lg font-normal text-base text-muted-foreground md:text-lg">
            {siteConfig.description}
          </p>

          <div className="mb-4 flex flex-wrap items-center gap-2 md:gap-3">
            <Button
              size="lg"
              variant="secondary"
              className="h-13 flex-1 px-5 sm:h-11 sm:flex-none dark:bg-card"
            >
              <FiTerminal className="text-primary" />
              <p className="mr-auto font-mono text-xs sm:mr-0">
                npx pushai setup
              </p>
              <Copy3 className="ml-2" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              nativeButton={false}
              render={<Link href="/button-variants" />}
              className="hidden sm:inline-flex"
            >
              <span>Get Started</span>
            </Button>
          </div>

          <TerminalWindow className="shadow-panel" title="~/repo pai commit">
            <p className="mb-4 text-cyan-600">
              ✦ npx pushai commit - v{version}
            </p>
            <p className="text-muted-foreground">
              <span className="text-term-green">✔</span> provider{" "}
              <span className="text-term-green">local · llama3.2:latest</span>
            </p>
            <p className="text-muted-foreground">
              <span className="text-term-green">✔</span> staged diff read{" "}
              <span className="text-term-green">1 file</span>
            </p>
            <p className="text-muted-foreground">
              <span className="text-term-green">✔</span> commit generated
            </p>
            <div className="ml-4 border-l border-l-cyan-600 pl-3">
              <p className="mt-3 text-cyan-600">
                feat(ui): improve terminal output spacing
              </p>
              <p className="mt-1 text-muted-foreground">
                Improve spacing between terminal elements to make the output
                easier to read.
              </p>
            </div>
            <p className="mt-3 text-muted-foreground">
              <span className="text-term-green">✔</span> how would you like to
              proceed? <span className="text-cyan-600">commit & push</span>
            </p>
            <p className="text-muted-foreground">
              <span className="text-term-green">✔</span> committed{" "}
              <a
                href="https://github.com/thelastofinusa/pushai/commit/5640ffd920b792922c4d44281e2dde373d3e83f1"
                target="_blank"
                rel="noreferrer"
                className="text-term-green hover:underline"
              >
                <span>5640ffd</span>
              </a>
            </p>
            <p className="text-muted-foreground">
              <span className="text-term-green">✔</span> successfully pushed
              changes
            </p>
            <p className="mt-4 text-term-green">
              <span className="">✔</span> commit created and pushed to main.
            </p>
          </TerminalWindow>
        </div>
      </Container>
    </div>
  );
};
