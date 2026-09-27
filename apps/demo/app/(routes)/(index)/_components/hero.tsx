import { FiTerminal } from "react-icons/fi";
import { Copy3 } from "reicon-react";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/shadcn/button";

export const HomeHero = () => {
  return (
    <div className="flex-1">
      <Container className="py-12 md:py-16 lg:py-24">
        <div className="flex flex-col gap-4 md:gap-6">
          <h1 className="font-light font-serif text-4xl capitalize sm:text-5xl md:text-6xl">
            Your Git workflow, <br />
            <span className="text-primary">quietly smarter.</span>
          </h1>
          <p className="max-w-lg font-light text-base text-muted-foreground md:text-lg">
            Generate thoughtful commit messages, switch AI providers, and push
            your work without leaving the terminal.
          </p>

          <div className="flex items-center gap-1">
            <Button size="lg" variant="secondary" className="px-5">
              <FiTerminal className="text-primary" />
              <p className="font-mono text-xs">npmx pushai setup</p>
              <Copy3 className="ml-2" />
            </Button>
            <Button size="lg" variant="ghost">
              <span>Get Started</span>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};
