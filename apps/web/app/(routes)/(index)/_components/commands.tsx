"use client";

import { useState } from "react";
import {
  Eyebrow,
  Prompt,
  Section,
  SectionTitle,
  Success,
  TerminalWindow,
} from "@/components/shared/primitives";
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

const commands = [
  {
    name: "setup",
    description: "Choose a provider and configure your key or local model.",
    lines: [
      ["selected mode", "byok"],
      ["provider ready", "anthropic"],
    ],
  },
  {
    name: "commit",
    description:
      "Stage your changes and review a generated commit message before committing.",
    lines: [
      ["staged diff read", "3 files"],
      ["message generated", "feat: add search"],
      ["committed to", "main"],
    ],
  },
  {
    name: "push",
    description: "Push your local commits to the origin remote.",
    lines: [["pushed to", "origin/main"]],
  },
  {
    name: "switch",
    description:
      "Choose a different active provider from those you have saved.",
    lines: [["active provider", "ollama"]],
  },
  {
    name: "peak",
    description: "List your saved providers and see which one is active.",
    lines: [
      ["active", "ollama"],
      ["available", "anthropic, openai"],
    ],
  },
  {
    name: "reset",
    description:
      "Remove one provider or clear your whole configuration and keys.",
    lines: [["removed provider", "anthropic"]],
  },
  {
    name: "update",
    description: "Check npm for a newer version and install it in place.",
    lines: [["checked npm", "pushai"]],
  },
];

export const Commands = () => {
  const [command, setCommand] = useState("setup");

  const selected = commands.find((c) => c.name === command) ?? commands[0];

  return (
    <Section id="commands">
      <Eyebrow>Commands</Eyebrow>

      <SectionTitle subtitle="Small enough to remember, useful enough to stay in your workflow.">
        Six commands. That&apos;s the whole tool.
      </SectionTitle>

      {/* Desktop */}
      <Frame
        variant="inverse"
        className="hidden h-max w-full flex-col items-stretch rounded-xl bg-card sm:flex-row sm:items-center md:flex md:rounded-full"
      >
        <FramePanel className="flex items-center rounded-lg border-0 p-0! shadow-none md:rounded-full">
          {commands.map((item) => (
            <Button
              key={item.name}
              size="sm"
              onClick={() => setCommand(item.name)}
              variant={command === item.name ? "default" : "ghost"}
              className="flex-1 rounded-lg md:rounded-full"
            >
              pai {item.name}
            </Button>
          ))}
        </FramePanel>
      </Frame>

      <div className="mt-7">
        <div className="grid items-start gap-8 py-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-16">
          <div>
            <div className="flex justify-between gap-6">
              <div className="flex flex-col gap-1">
                <h3 className="font-serif text-2xl">pai {selected.name}</h3>

                <p className="max-w-sm text-muted-foreground text-sm leading-relaxed">
                  {selected.description}
                </p>
              </div>

              {/* Mobile */}
              <div className="md:hidden">
                <Select
                  value={command}
                  onValueChange={(value) => value && setCommand(value)}
                >
                  <SelectTrigger className="rounded-full">
                    <SelectValue>
                      {(value) => {
                        const selected = commands.find(
                          (item) => item.name === value,
                        );

                        if (!selected) return null;

                        return <span>{selected.name}</span>;
                      }}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent alignItemWithTrigger={false} align="end">
                    <SelectGroup>
                      {commands.map((item) => (
                        <SelectItem key={item.name} value={item.name}>
                          <span>pai {item.name}</span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selected.name === "commit" && (
              <div className="mt-7 overflow-x-auto">
                <table className="w-full max-w-md text-left text-xs">
                  <caption className="mb-3 text-left font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
                    Flags
                  </caption>

                  <tbody className="divide-y divide-border border-border border-y">
                    {[
                      ["-p, --push", "Commit and push"],
                      ["-m, --message <text>", "Use your own message"],
                      ["--dry-run", "Preview without committing"],
                    ].map(([flag, detail]) => (
                      <tr key={flag}>
                        <th
                          scope="row"
                          className="py-3 pr-4 font-mono font-normal text-foreground"
                        >
                          {flag}
                        </th>

                        <td className="py-3 text-muted-foreground">{detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <TerminalWindow title={`~/repo pai ${selected.name}`}>
            <Prompt>pai {selected.name}</Prompt>

            <div className="mt-3 space-y-1">
              {selected.lines.map(([label, value]) => (
                <Success key={label} value={value}>
                  {label}
                </Success>
              ))}
            </div>
          </TerminalWindow>
        </div>
      </div>
    </Section>
  );
};
