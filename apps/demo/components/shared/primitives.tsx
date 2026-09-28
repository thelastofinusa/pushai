import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Frame } from "../ui/reui/frame";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-6", className)}>
      {children}
    </div>
  );
}

export function Section({
  children,
  className,
  bordered = true,
}: {
  children: ReactNode;
  className?: string;
  bordered?: boolean;
}) {
  return (
    <section
      className={cn(
        "py-20 md:py-24",
        bordered && "border-border border-b",
        className,
      )}
    >
      <Container>{children}</Container>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 font-medium font-mono text-[11px] text-accent uppercase tracking-[0.18em]">
      {children}
    </p>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="font-semibold text-2xl md:text-3xl">{children}</h2>;
}

export function TextLink({
  children,
  className,
  href = "#",
}: {
  children: ReactNode;
  className?: string;
  href?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 font-medium text-accent text-sm transition-opacity hover:opacity-70",
        className,
      )}
    >
      {children}
      <span aria-hidden>→</span>
    </a>
  );
}

/** Small floating toolbar used on the demo panels. */
export function FloatingToolbar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-lg border border-border bg-card p-1.5 shadow-float",
        className,
      )}
    >
      <div className="grid grid-cols-3 gap-1">
        {["openai", "claude", "ollama"].map((p, i) => (
          <span
            key={p}
            title={p}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-md font-mono text-[9px] uppercase",
              i === 0
                ? "bg-accent text-accent-foreground"
                : "bg-secondary text-muted-foreground",
            )}
          >
            {p.slice(0, 2)}
          </span>
        ))}
      </div>
      <div className="h-px bg-border" />
      <div className="flex items-center justify-between gap-2 rounded-md px-1 py-0.5">
        <span className="font-mono text-[9px] text-muted-foreground">dry</span>
        <span className="flex h-3 w-6 items-center rounded-full bg-secondary p-0.5">
          <span className="h-2 w-2 rounded-full bg-muted-foreground" />
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 rounded-md px-1 py-0.5">
        <span className="font-mono text-[9px] text-muted-foreground">push</span>
        <span className="flex h-3 w-6 items-center justify-end rounded-full bg-accent p-0.5">
          <span className="h-2 w-2 rounded-full bg-accent-foreground" />
        </span>
      </div>
    </div>
  );
}

export function TerminalWindow({
  children,
  className,
  title = "zsh — pai",
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <Frame className="rounded-[20px]" variant="inverse">
      <div
        className={cn("overflow-hidden rounded-2xl border bg-card", className)}
      >
        <div className="flex items-center gap-1 border-b px-3 py-2">
          <span className="size-2 rounded-full bg-term-red" />
          <span className="size-2 rounded-full bg-term-yellow" />
          <span className="size-2 rounded-full bg-term-green" />
          <span className="ml-2 font-mono text-[10px] text-muted-foreground">
            {title}
          </span>
        </div>
        <div className="px-4 py-3 font-mono text-[11px] text-terminal-foreground leading-relaxed md:text-xs">
          {children}
        </div>
      </div>
    </Frame>
  );
}

export function Prompt({ children }: { children: ReactNode }) {
  return (
    <p>
      <span className="text-term-green">➜</span>{" "}
      <span className="text-muted-foreground">~/repo</span>{" "}
      <span className="text-foreground">{children}</span>
    </p>
  );
}
