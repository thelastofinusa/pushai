"use client";

import { cn } from "cn";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Frame } from "../ui/reui/frame";
import { Container, type ContainerVariantsType } from "./container";

export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={cn("section-reveal", visible && "is-visible", className)}
    >
      {children}
    </div>
  );
}
export function Section({
  children,
  className,
  id,
  size = "default",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  size?: ContainerVariantsType["size"];
}) {
  return (
    <section
      id={id}
      className={cn("border-b py-16 sm:py-20 md:py-24", className)}
    >
      <Container size={size}>
        <Reveal>{children}</Reveal>
      </Container>
    </section>
  );
}
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[10px] text-primary uppercase tracking-[0.18em]",
        className,
      )}
    >
      {children}
    </p>
  );
}
export function SectionTitle({
  children,
  subtitle,
}: {
  children: ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="mb-10 md:mb-12">
      <h2 className="font-normal font-serif text-3xl leading-tight md:text-4xl">
        {children}
      </h2>
      {subtitle && (
        <p className="mt-2 max-w-lg text-muted-foreground text-sm leading-relaxed md:text-base">
          {subtitle}
        </p>
      )}
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
    <Frame className="rounded-2xl" variant="ghost">
      <div
        className={cn(
          "overflow-hidden rounded-[13px] border bg-card",
          className,
        )}
      >
        <div className="flex items-center gap-1 border-b px-3 py-2">
          <span className="size-2 rounded-full bg-term-red" />
          <span className="size-2 rounded-full bg-term-yellow" />
          <span className="size-2 rounded-full bg-term-green" />
          <span className="ml-2 font-mono text-[10px] text-muted-foreground">
            {title}
          </span>
        </div>
        <div className="px-4 py-3 font-mono text-[11px] text-muted-foreground leading-relaxed md:text-xs">
          {children}
        </div>
      </div>
    </Frame>
  );
}
export function Prompt({ children }: { children: ReactNode }) {
  return (
    <p className="whitespace-nowrap">
      <span className="text-cyan-600">»</span>{" "}
      <span className="text-foreground">{children}</span>
    </p>
  );
}
export function Success({
  children,
  value,
  className,
}: {
  children: ReactNode;
  value?: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("flex gap-2", className)}>
      <span className="text-term-green">✔</span> {children}{" "}
      {value && <span className="text-cyan-highlight">{value}</span>}
    </p>
  );
}
