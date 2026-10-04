import Link from "next/link";
import { Container } from "@/components/shared/container";
import { siteConfig } from "@/config/site.config";
import { LogoSVG } from "./logo-svg";

const links = [
  ["GitHub", "https://github.com/thelastofinusa/pushai"],
  ["npm", "https://www.npmjs.com/package/pushai"],
  ["MIT license", "https://github.com/thelastofinusa/pushai/blob/main/LICENSE"],
];

export const Footer = () => {
  return (
    <footer className="border-border border-t py-10">
      <Container>
        <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-start">
          <div>
            <Link
              href="#top"
              className="font-medium text-base text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            >
              <LogoSVG className="h-auto! w-12!" />
            </Link>
            <p className="mt-2 text-muted-foreground text-sm">
              {siteConfig.title}
            </p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3">
            {links.map(([label, href]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground text-sm transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
        <p className="mt-12 font-mono text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name}. MIT licensed.
        </p>
      </Container>
    </footer>
  );
};
