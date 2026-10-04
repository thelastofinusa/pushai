import {
  Eyebrow,
  Prompt,
  Section,
  SectionTitle,
  Success,
  TerminalWindow,
} from "@/components/shared/primitives";

const steps = [
  {
    description: "Choose a provider and configure your AI.",
    command: "pai setup",
    output: "provider ready",
    value: "byok / local",
  },
  {
    description: "Review changes and generate message.",
    command: "pai commit",
    output: "message generated",
    value: "feat: add search",
  },
  {
    description: "Push your changes to the remote repository.",
    command: "pai push",
    output: "pushed to",
    value: "origin/main",
  },
];
export const Workflow = () => {
  return (
    <Section id="workflow">
      <Eyebrow className="mb-1">Workflow</Eyebrow>
      <SectionTitle subtitle="From changed files to a finished commit, without leaving your terminal.">
        How it works
      </SectionTitle>
      <div className="grid gap-6 md:grid-cols-3 md:gap-4">
        {steps.map((step) => (
          <div key={step.command} className="flex min-w-0 flex-col">
            <h3 className="font-medium">{step.command}</h3>
            <p className="mt-0.5 mb-4 text-muted-foreground text-sm leading-relaxed">
              {step.description}
            </p>
            <TerminalWindow
              title={`~/repo ${step.command}`}
              className="mt-auto"
            >
              <Prompt>{step.command}</Prompt>
              <Success value={step.value}>{step.output}</Success>
            </TerminalWindow>
          </div>
        ))}
      </div>
    </Section>
  );
};
