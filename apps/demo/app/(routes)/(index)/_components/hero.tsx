"use client";

import type { PackageManagerInfo } from "@pushai/types";
import { useEffect, useState } from "react";
import type { IconType } from "react-icons";
import { FiCheck, FiChevronDown } from "react-icons/fi";
import { SiBun, SiNpm, SiPnpm, SiYarn } from "react-icons/si";
import { Copy3 } from "reicon-react";
import { Container } from "@/components/shared/container";
import { TerminalWindow } from "@/components/shared/primitives";
import { IconSwap, IconSwapItem } from "@/components/ui/chanhdai/icon-swap";
import { Frame, FramePanel } from "@/components/ui/reui/frame";
import { Button } from "@/components/ui/shadcn/button";
import { Separator } from "@/components/ui/shadcn/separator";
import { siteConfig } from "@/config/site.config";

const MANAGERS: Record<string, PackageManagerInfo & { icon: IconType }> = {
  npm: { name: "npm", installer: "npm install", runner: "npx", icon: SiNpm },
  pnpm: {
    name: "pnpm",
    installer: "pnpm add",
    runner: "pnpm dlx",
    icon: SiPnpm,
  },
  yarn: {
    name: "yarn",
    installer: "yarn add",
    runner: "yarn dlx",
    icon: SiYarn,
  },
  bun: { name: "bun", installer: "bun add", runner: "bunx", icon: SiBun },
} as const;

export const HomeHero = () => {
  const [version, setVersion] = useState("0.0.0");
  const [pm, setPm] = useState<keyof typeof MANAGERS>("npm");
  const [installMethod, setInstallMethod] = useState<"instant" | "global">(
    "global",
  );
  const [copied, setCopied] = useState(false);

  // Dynamically generate the commands based on the selected package manager
  const selectedManager = MANAGERS[pm];
  const SelectedIcon = selectedManager.icon;

  const installOptions = {
    instant: {
      label: "Run Instantly",
      command: `${selectedManager.runner} pushai setup`,
      next: null,
    },
    global: {
      label: "Install Globally",
      command:
        pm === "yarn"
          ? "yarn global add pushai"
          : `${selectedManager.installer} -g pushai`,
      next: "pai setup",
    },
  };

  const selected = installOptions[installMethod];

  useEffect(() => {
    fetch("/api/version")
      .then((res) => res.json())
      .then((data) => setVersion(data))
      .catch(() => setVersion("0.0.0"));
  }, []);

  const copyCommand = async () => {
    await navigator.clipboard.writeText(
      selected.next
        ? `${selected.command} && ${selected.next}`
        : selected.command,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <p className="mb-2 max-w-xl font-normal text-base text-muted-foreground md:text-lg">
            {siteConfig.description}
          </p>

          {/* Wrapper layout for Frame and Select */}
          <div className="mb-6 flex w-full flex-col-reverse items-end gap-3 sm:w-max sm:flex-row sm:items-center sm:gap-4">
            <Frame
              variant="inverse"
              className="flex h-max w-full flex-col items-stretch rounded-xl bg-card sm:w-auto sm:flex-row sm:items-center md:rounded-full"
            >
              <FramePanel className="flex items-center rounded-lg border-0 p-0! shadow-none md:rounded-full">
                {(
                  Object.keys(installOptions) as Array<
                    keyof typeof installOptions
                  >
                ).map((method) => (
                  <Button
                    key={method}
                    size="sm"
                    onClick={() => setInstallMethod(method)}
                    variant={installMethod === method ? "default" : "ghost"}
                    className="flex-1 rounded-lg md:rounded-full"
                  >
                    <span>{installOptions[method].label}</span>
                  </Button>
                ))}
              </FramePanel>

              <Separator
                orientation="vertical"
                className="mx-2 my-auto hidden h-4 md:block"
              />

              <div className="flex flex-1 items-center gap-2 rounded-lg border pr-2 pl-3 sm:rounded-full sm:border-none sm:px-0 md:rounded-xl">
                <div className="scrollbar-hide mask-image:linear-gradient(to_right,white_80%,transparent_100%)] flex flex-1 items-center gap-2 overflow-x-auto text-xs">
                  <span className="select-none text-primary">$</span>
                  <code className="whitespace-nowrap font-medium font-mono text-foreground">
                    {selected.command}
                  </code>

                  {selected.next && (
                    <div className="fade-in slide-in-from-left-2 flex animate-in items-center gap-2 duration-300">
                      <span className="select-none font-mono text-muted-foreground/40">
                        &&
                      </span>
                      <code className="whitespace-nowrap font-mono text-muted-foreground">
                        {selected.next}
                      </code>
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    onClick={copyCommand}
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0"
                  >
                    <IconSwap>
                      <IconSwapItem key={String(copied)}>
                        {copied ? <FiCheck /> : <Copy3 />}
                      </IconSwapItem>
                    </IconSwap>
                    <span className="sr-only">Copy command</span>
                  </Button>
                </div>
              </div>
            </Frame>

            {/* External Package Manager Switcher */}
            <div className="group relative flex cursor-pointer items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-muted-foreground shadow-xs transition-colors hover:bg-muted/50 hover:text-foreground sm:border-transparent sm:bg-transparent sm:py-1 sm:pr-1 sm:shadow-none">
              <SelectedIcon className="size-3.5 shrink-0" />
              <span className="font-mono text-sm">{pm}</span>
              <FiChevronDown className="size-4 opacity-50 transition-transform group-hover:translate-y-px" />

              <select
                className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0"
                value={pm}
                onChange={(e) => setPm(e.target.value as keyof typeof MANAGERS)}
                title="Switch package manager"
              >
                {Object.keys(MANAGERS).map((key) => (
                  <option key={key} value={key}>
                    {MANAGERS[key].name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* End Layout Wrapper */}

          <TerminalWindow className="shadow-panel" title="~/repo pai commit">
            <p className="mb-4 text-cyan-600">
              ✦ {selectedManager.runner} pushai commit - v{version}
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
