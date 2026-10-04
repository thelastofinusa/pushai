import type { Metadata } from "next";

import "./globals.css";
import GlobalProvider from "@/components/providers";
import { siteConfig } from "@/config/site.config";
import { fontVariable } from "@/lib/fonts";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} - ${siteConfig.slogan}`,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url as string),
  authors: [
    {
      name: siteConfig.nickname,
      url: `https://x.com/${siteConfig.username}`,
    },
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: {
      default: `${siteConfig.name} - ${siteConfig.slogan}`,
      template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/opengraph.png`,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: `${siteConfig.name} - ${siteConfig.slogan}`,
      template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
    images: [`${siteConfig.url}/"opengraph.png`],
    creator: `@${siteConfig.username}`,
  },
  icons: "/favicon.svg",
  manifest: `${siteConfig.url}/site.webmanifest`,
};

export default function RootLayout(props: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={fontVariable("h-full font-sans antialiased")}
    >
      <body className="flex min-h-full flex-col">
        <GlobalProvider>{props.children}</GlobalProvider>
      </body>
    </html>
  );
}
