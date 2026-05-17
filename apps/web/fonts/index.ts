import { cn } from "@workspace/ui/lib/utils"
import localFont from "next/font/local"

const fontSans = localFont({
  src: "./BricolageGrotesque/BricolageGrotesque-VariableFont_opsz,wdth,wght.ttf",
  variable: "--font-sans",
  preload: true,
})

const fontMono = localFont({
  src: "./GeistMono/GeistMono-VariableFont_wght.ttf",
  variable: "--font-mono",
  preload: true,
})

export const fontVariable = (className?: string) =>
  cn(fontSans.variable, fontMono.variable, className)
