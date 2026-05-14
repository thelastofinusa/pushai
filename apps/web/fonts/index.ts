import { cn } from "@workspace/ui/lib/utils"
import localFont from "next/font/local"

const fontHead = localFont({
  src: "./ArchivoBlack/ArchivoBlack-Regular.ttf",
  variable: "--font-head",
  preload: true,
})

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
  cn(fontHead.variable, fontSans.variable, fontMono.variable, className)
