import { AiOutlineOpenAI } from "react-icons/ai";
import {
  SiAnthropic,
  SiGooglegemini,
  SiHuggingface,
  SiOllama,
} from "react-icons/si";
import { Eyebrow, Section, SectionTitle } from "@/components/shared/primitives";
import { Frame } from "@/components/ui/reui/frame";

const providers = [
  {
    number: "01",
    type: "CLOUD",
    title: "Bring Your Own API Key",
    description: "Keys are validated live before they're saved.",
    brands: [
      { name: "Anthropic", icon: SiAnthropic },
      { name: "OpenAI", icon: AiOutlineOpenAI },
      { name: "Gemini", icon: SiGooglegemini },
      { name: "Hugging Face", icon: SiHuggingface },
    ],
  },
  {
    number: "02",
    type: "LOCAL",
    title: "Run AI locally",
    description: "Use Ollama to run models locally.",
    brands: [{ name: "Ollama", icon: SiOllama }],
  },
];

const managedProvider = {
  title: "Managed mode",
  badge: "Coming soon",
  description: "No key required.",
};

export const Providers = () => {
  return (
    <Section id="providers">
      <Eyebrow>Bring your own model</Eyebrow>

      <SectionTitle subtitle="Choose the service that fits, or keep everything on your machine.">
        Your model, your rules
      </SectionTitle>

      <div className="grid gap-4 md:grid-cols-2">
        {providers.map(({ number, type, title, description, brands }) => (
          <Frame key={type} variant="ghost" className="rounded-2xl">
            <div className="h-full rounded-[13px] border bg-background p-6 md:p-8">
              <Eyebrow>
                {number} / {type}
              </Eyebrow>

              <h3 className="mt-5 font-serif text-2xl">{title}</h3>

              <p className="mt-2 text-muted-foreground text-sm">
                {description}
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {brands.map(({ name, icon: Icon }) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs"
                  >
                    <Icon aria-hidden="true" className="size-3" />
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </Frame>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[13px] border border-dashed px-6 py-5">
        <span className="font-medium">{managedProvider.title}</span>

        <span className="rounded-full bg-secondary px-2.5 py-1 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
          {managedProvider.badge}
        </span>

        <span className="text-muted-foreground text-sm">
          {managedProvider.description}
        </span>
      </div>
    </Section>
  );
};
