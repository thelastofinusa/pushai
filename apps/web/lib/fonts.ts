import { cn } from "cn";
import {
  Fira_Mono as FontMono,
  Jost as FontSans,
  Cormorant_Garamond as FontSerif,
} from "next/font/google";

const fontSans = FontSans({ subsets: ["latin"], variable: "--font-sans" });

const fontSerif = FontSerif({
  variable: "--font-serif",
  subsets: ["latin"],
});

const fontMono = FontMono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const fontVariable = (className?: string) =>
  cn(className, fontSans.variable, fontSerif.variable, fontMono.variable);
