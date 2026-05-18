import type { Metadata } from "next"
import { assetPath, imagePath } from "@typest/nextjs"

import "@workspace/ui/globals.css"
import { fontVariable } from "@/fonts"
import { siteConfig } from "@/config/site.config"
import Provider from "@/components/providers/lenis.provider"
import { ThemeProvider } from "@/components/providers/theme.provider"
import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"
import { TailwindIndicator } from "@/components/shared/tailwind-indicator"
import { Analytics } from "@vercel/analytics/next"

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
        url: `${siteConfig.url}${imagePath("opengraph.png")}`,
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
    images: [`${siteConfig.url}${imagePath("opengraph.png")}`],
    creator: `@${siteConfig.username}`,
  },
  icons: imagePath("logo.svg"),
  manifest: `${siteConfig.url}${assetPath("site.webmanifest")}`,
}

export default function RootLayout(props: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={fontVariable("antialiased")}>
        <Provider>
          <ThemeProvider>
            <Header />
            {props.children}
            <Footer />
            <TailwindIndicator />
          </ThemeProvider>
          <Analytics />
        </Provider>
      </body>
    </html>
  )
}
