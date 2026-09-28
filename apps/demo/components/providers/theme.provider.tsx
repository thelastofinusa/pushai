"use client";

import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "@teispace/next-themes";
import React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useSoundFx } from "./sound.provider";

type Theme = "dark" | "light" | "system";
type ResolvedTheme = "dark" | "light";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  resolvedTheme?: ResolvedTheme;
  mounted: boolean;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeProviderState>({
  theme: "system",
  resolvedTheme: undefined,
  mounted: false,
  setTheme: () => {},
});

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
      enableColorScheme
      storageKey={storageKey}
      disableTransitionOnChange
    >
      <ThemeController defaultTheme={defaultTheme}>{children}</ThemeController>
    </NextThemesProvider>
  );
}

function ThemeController({
  children,
  defaultTheme,
}: {
  children: React.ReactNode;
  defaultTheme: Theme;
}) {
  const {
    theme,
    resolvedTheme: nextResolvedTheme,
    setTheme: setNextTheme,
  } = useNextTheme();

  const { play } = useSoundFx();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const resolvedTheme: ResolvedTheme | undefined =
    nextResolvedTheme === "dark" || nextResolvedTheme === "light"
      ? nextResolvedTheme
      : undefined;

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      const updateTheme = () => {
        setNextTheme(nextTheme);
        play("add-to-cart");
      };

      if (typeof document.startViewTransition !== "function") {
        updateTheme();
        return;
      }

      document.startViewTransition(updateTheme);
    },
    [setNextTheme, play],
  );

  const toggleTheme = React.useCallback(() => {
    if (!resolvedTheme) return;

    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  useHotkeys("d", toggleTheme);

  return (
    <ThemeContext.Provider
      value={{
        theme:
          theme === "dark" || theme === "light" || theme === "system"
            ? theme
            : defaultTheme,
        resolvedTheme: mounted ? resolvedTheme : undefined,
        mounted,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return React.useContext(ThemeContext);
}
