import type { Metadata } from "next"

import "@workspace/ui/globals.css"
import { fontVariable } from "@/fonts"
import { ThemeProvider } from "@/components/theme-provider"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { siteConfig } from "@/config/site.config"

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
    images: [`${siteConfig.url}/opengraph.png`],
    creator: `@${siteConfig.username}`,
  },
  icons: "/logo.svg",
  manifest: `${siteConfig.url}/site.webmanifest`,
}

export default function RootLayout(props: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={fontVariable("font-sans antialiased")}>
        <ThemeProvider>{props.children}</ThemeProvider>
        <TailwindIndicator />
      </body>
    </html>
  )
}
