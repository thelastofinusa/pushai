import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { fontVariables } from "@/lib/fonts";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={fontVariables()}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
