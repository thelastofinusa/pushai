import { Eyebrow, Section, SectionTitle } from "@/components/shared/primitives";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/shadcn/accordion";

const faqs = [
  [
    "Do I need an API key?",
    "Not if you run AI locally with Ollama. For Anthropic, OpenAI, Gemini, or Hugging Face, bring your own key. Managed mode is coming soon.",
  ],
  [
    "Can I use it fully offline?",
    "Yes. Choose local mode with Ollama and an installed model. Your code stays on your machine.",
  ],
  [
    "Where are my keys stored?",
    "In your OS keychain when available, or in a permission-locked local file per provider. Your config file never contains secrets.",
  ],
  [
    "Which package managers work?",
    "Install globally with npm, pnpm, yarn, bun, or nub. The CLI command is pai.",
  ],
  [
    "How do I uninstall it?",
    "Run pai reset first if you want to remove saved config and keys, then npm uninstall -g pushai.",
  ],
];

export const FAQs = () => {
  return (
    <Section id="faq">
      <Eyebrow>FAQ</Eyebrow>
      <SectionTitle subtitle="A few practical details before you start.">
        Good to know
      </SectionTitle>
      <Accordion className="max-w-3xl">
        {faqs.map(([question, answer], i) => (
          <AccordionItem key={question} value={`faq-${i}`}>
            <AccordionTrigger className="py-5 text-left font-normal text-base hover:no-underline">
              {question}
            </AccordionTrigger>
            <AccordionContent className="max-w-2xl pb-5 text-muted-foreground text-sm leading-relaxed">
              {answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
};
