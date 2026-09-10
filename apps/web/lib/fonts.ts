import { cn } from "cn";
import localFont from "next/font/local";

const fontSans = localFont({
  src: "../public/fonts/BricolageGrotesque/VariableFont_opsz,wdth,wght.ttf",
  variable: "--font-fontSans",
  display: "swap",
  style: "normal",
});

const fontSerif = localFont({
  src: [
    {
      path: "../public/fonts/PPEditorialNew/Ultralight.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../public/fonts/PPEditorialNew/UltralightItalic.otf",
      weight: "200",
      style: "italic",
    },
  ],
  variable: "--font-fontSerif",
  display: "swap",
});

const fontMono = localFont({
  src: "../public/fonts/GeistMono/VariableFont_wght.ttf",
  variable: "--font-fontMono",
  display: "swap",
  style: "normal",
});

export const fontVariables = (className?: string) =>
  cn(fontSans.variable, fontSerif.variable, fontMono.variable, className);
