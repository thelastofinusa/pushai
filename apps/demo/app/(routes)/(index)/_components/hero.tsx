"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiTerminal } from "react-icons/fi";
import { Copy3 } from "reicon-react";
import { Container } from "@/components/shared/container";
import { Prompt, TerminalWindow } from "@/components/shared/primitives";
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

          <TerminalWindow className="shadow-panel">
            <Prompt>pai commit</Prompt>
            <p className="my-4 text-primary">» pai commit - v{version}</p>
            <p className="text-muted-foreground">
              ⠿ reading staged diff{" "}
              <span className="font-medium text-term-green">3 files</span>
            </p>
            <p className="text-muted-foreground">
              ⠿ provider{" "}
              <span className="font-medium text-term-green">
                openai:gpt-5-mini
              </span>
            </p>
            <div className="ml-4 border-l-2 border-l-primary pl-4">
              <p className="mt-3 text-primary">
                feat(api): add request rate limiting
              </p>
              <p className="mt-1 text-muted-foreground">
                Protect API routes with configurable request limits
              </p>
            </div>
            <p className="mt-3 text-muted-foreground">
              <span className="font-medium text-term-green">✔</span> committed{" "}
              <span className="font-medium text-term-green">a91f2c4</span>
            </p>
            <p className="text-muted-foreground">
              <span className="font-medium text-term-green">✔</span> pushed
              changes
            </p>
            <p className="mt-4 text-muted-foreground">
              <span className="font-medium text-term-green">✔</span> commit
              message generated successfully
            </p>
          </TerminalWindow>
        </div>
      </Container>
    </div>
  );
};
