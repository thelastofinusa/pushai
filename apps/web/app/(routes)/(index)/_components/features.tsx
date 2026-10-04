import {
  DiagramTree,
  EyeScan,
  Layers2,
  PasswordAlt,
  PenWriting,
  WandSparkle,
} from "reicon-react";
import { Eyebrow, Section, SectionTitle } from "@/components/shared/primitives";
import { Frame } from "@/components/ui/reui/frame";

const features = [
  {
    icon: WandSparkle,
    title: "Conventional commits",
    description:
      "Context-aware messages that follow the conventional commits format.",
  },
  {
    icon: PenWriting,
    title: "Review before you commit",
    description: "Accept, edit, or regenerate every message.",
  },
  {
    icon: EyeScan,
    title: "Dry run",
    description: "--dry-run previews the message without committing.",
  },
  {
    icon: DiagramTree,
    title: "Conflict check",
    description:
      "Stops and lists unresolved conflicting files before anything happens.",
  },
  {
    icon: Layers2,
    title: "Multiple providers",
    description: "Configure several and hop between them with pai switch.",
  },
  {
    icon: PasswordAlt,
    title: "Secure by default",
    description:
      "Keys live in your OS keychain, with a permission-locked fallback. Config never contains secrets.",
  },
];

export const Features = () => {
  return (
    <Section id="features">
      <Eyebrow>Features</Eyebrow>
      <SectionTitle subtitle="The essentials, handled carefully.">
        Everything you need, nothing you don&apos;t
      </SectionTitle>
      <Frame variant="ghost" className="rounded-2xl">
        <div className="grid divide-y overflow-hidden rounded-[13px] border bg-card sm:grid-cols-2 sm:divide-x lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }, _i) => (
            <div key={title} className="min-w-0 p-6 sm:p-7">
              <Icon
                size={19}
                strokeWidth={1.6}
                className="mb-7 text-primary"
                aria-hidden="true"
              />
              <h3 className="font-medium">{title}</h3>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </Frame>
    </Section>
  );
};
