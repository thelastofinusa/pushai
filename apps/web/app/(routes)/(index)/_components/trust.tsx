import {
  Eyebrow,
  Section,
  SectionTitle,
  TerminalWindow,
} from "@/components/shared/primitives";

const points = [
  "Local mode runs via Ollama.",
  "Keys are stored in your OS keychain.",
  "MIT licensed and open source.",
];
export const Trust = () => {
  return (
    <Section id="trust">
      <Eyebrow>Trust</Eyebrow>
      <div className="grid items-start gap-10 md:grid-cols-2 md:gap-20">
        <div>
          <SectionTitle subtitle="Your setup is yours to control.">
            Your code stays yours.
          </SectionTitle>
          <ul className="space-y-4">
            {points.map((p) => (
              <li key={p} className="flex gap-2 text-muted-foreground text-sm">
                <span className="-mt-px font-mono text-term-green">✔</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <TerminalWindow title="~/.config/pushai/config.json">
          <pre className="wrap-break-word whitespace-pre-wrap text-foreground">
            {"{\n  "}
            <span className="text-muted-foreground">"activeProvider"</span>
            {": "}
            <span className="text-cyan-highlight">"ollama"</span>
            {",\n  "}
            <span className="text-muted-foreground">"model"</span>
            {": "}
            <span className="text-cyan-highlight">"local-model"</span>
            {"\n}"}
          </pre>
          <p className="mt-4 text-muted-foreground">{"//"} no keys in config</p>
        </TerminalWindow>
      </div>
    </Section>
  );
};
