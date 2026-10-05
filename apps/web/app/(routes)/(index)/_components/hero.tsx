"use client";

import type { PackageManagerInfo } from "@pushai/types";
import { motion } from "motion/react";
import { useState } from "react";
import type { IconType } from "react-icons";
import { FiCheck, FiTerminal } from "react-icons/fi";
import { SiBun, SiNpm, SiPnpm, SiYarn } from "react-icons/si";
import { Copy3 } from "reicon-react";
import { useSiteStats } from "@/components/providers/stats.provider";
import { Container } from "@/components/shared/container";
import { TerminalWindow } from "@/components/shared/primitives";
import { IconSwap, IconSwapItem } from "@/components/ui/chanhdai/icon-swap";
import { Frame, FramePanel } from "@/components/ui/reui/frame";
import { Button } from "@/components/ui/shadcn/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn/select";
import { Separator } from "@/components/ui/shadcn/separator";
import { siteConfig } from "@/config/site.config";

const MANAGERS: Record<
  string,
  PackageManagerInfo & { icon: IconType; global: string }
> = {
  npm: {
    name: "npm",
    installer: "npm install",
    runner: "npx",
    global: "npm install -g",
    icon: SiNpm,
  },
  pnpm: {
    name: "pnpm",
    installer: "pnpm add",
    runner: "pnpm dlx",
    global: "pnpm add -g",
    icon: SiPnpm,
  },
  yarn: {
    name: "yarn",
    installer: "yarn add",
    runner: "yarn dlx",
    global: "yarn add global",
    icon: SiYarn,
  },
  bun: {
    name: "bun",
    installer: "bun add",
    runner: "bunx",
    global: "bun add -g",
    icon: SiBun,
  },
  nub: {
    name: "nub",
    installer: "nub install",
    runner: "nubx",
    global: "nub install -g",
    icon: FiTerminal,
  },
} as const;

export const HomeHero = () => {
  const { stats } = useSiteStats();
  const [pm, setPm] = useState<keyof typeof MANAGERS>("npm");
  const [installMethod, setInstallMethod] = useState<"instant" | "global">(
    "global",
  );
  const [copied, setCopied] = useState(false);

  const selectedManager = MANAGERS[pm];

  const installOptions = {
    instant: {
      label: "Run Instantly",
      command: `${selectedManager.runner} pushai setup`,
      next: null,
    },
    global: {
      label: "Install Globally",
      command: `${selectedManager.global} pushai`,
      next: "pai setup",
    },
  };

  const selected = installOptions[installMethod];

  const copyCommand = async () => {
    const text = selected.next
      ? `${selected.command} && ${selected.next}`
      : selected.command;
    await navigator.clipboard.writeText(text);
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
                {stats.version}
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
          <p className="mb-2 max-w-lg font-normal text-muted-foreground text-sm md:text-base">
            {siteConfig.description}
          </p>

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

            <Select
              value={pm}
              onValueChange={(value) => {
                if (value) {
                  setPm(value as keyof typeof MANAGERS);
                }
              }}
            >
              <SelectTrigger className="rounded-full">
                <SelectValue>
                  {(item) => {
                    const manager = MANAGERS[item as keyof typeof MANAGERS];

                    if (!manager) return null;

                    const Icon = manager.icon;

                    return (
                      <span className="flex items-center gap-2">
                        <Icon className="size-3.5" />
                        <span>{manager.name}</span>
                      </span>
                    );
                  }}
                </SelectValue>
              </SelectTrigger>

              <SelectContent alignItemWithTrigger={false} align="end">
                <SelectGroup>
                  {Object.entries(MANAGERS).map(([key, manager]) => {
                    const Icon = manager.icon;

                    return (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <Icon className="size-3.5" />
                          <span>{manager.name}</span>
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <TerminalWindow className="shadow-panel" title="~/repo pai commit">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.12,
                  },
                },
              }}
            >
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 4 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.25 }}
                className="mb-4 text-cyan-600"
              >
                ✦ running {selectedManager.runner} pushai commit -{" "}
                {stats.version}
              </motion.p>

              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 4 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.25 }}
                className="text-muted-foreground"
              >
                <span className="text-term-green">✔</span> provider{" "}
                <span className="text-cyan-600">gemini [gemini-3.5-flash]</span>
              </motion.p>

              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 4 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.25 }}
                className="text-muted-foreground"
              >
                <span className="text-term-green">✔</span> staged diff read{" "}
                <span className="text-cyan-600">1 file</span>
              </motion.p>

              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 4 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.25 }}
                className="text-muted-foreground"
              >
                <span className="text-term-green">✔</span> committing to{" "}
                <span className="text-cyan-600">main</span>
              </motion.p>

              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 4 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.25 }}
                className="text-muted-foreground"
              >
                <span className="text-term-green">✔</span> message generated
              </motion.p>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 4 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.25 }}
                className="ml-4 border-l border-l-cyan-600 pl-3"
              >
                <p className="mt-3 text-cyan-600">
                  feat(ui): improve terminal output spacing
                </p>
                <p className="mt-1 text-muted-foreground">
                  Improve spacing between terminal elements to make the output
                  easier to read.
                </p>
              </motion.div>

              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 4 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.25 }}
                className="mt-3 text-muted-foreground"
              >
                <span className="text-term-green">✔</span> how would you like to
                proceed? <span className="text-cyan-600">commit & push</span>
              </motion.p>

              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 4 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.25 }}
                className="text-muted-foreground"
              >
                <span className="text-term-green">✔</span> committed{" "}
                <a
                  href="https://github.com/thelastofinusa/pushai/commit/5640ffd920b792922c4d44281e2dde373d3e83f1"
                  target="_blank"
                  rel="noreferrer"
                  className="text-term-green hover:underline"
                >
                  5640ffd
                </a>
              </motion.p>

              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 4 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.25 }}
                className="text-muted-foreground"
              >
                <span className="text-term-green">✔</span> successfully pushed
                changes
              </motion.p>

              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 4 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.25 }}
                className="mt-4 text-term-green"
              >
                ✔ commit created and pushed to main.
              </motion.p>
            </motion.div>
          </TerminalWindow>
        </div>
      </Container>
    </div>
  );
};
