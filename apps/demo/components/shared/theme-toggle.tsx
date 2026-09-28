import type { Button as ButtonPrimitive } from "@base-ui/react/button";
import type { VariantProps } from "class-variance-authority";
import type React from "react";
import { Moon, Sun } from "reicon-react";
import { useTheme } from "../providers/theme.provider";
import { IconSwap, IconSwapItem } from "../ui/chanhdai/icon-swap";
import { Button, type buttonVariants } from "../ui/shadcn/button";
import { Skeleton } from "../ui/shadcn/skeleton";

export const ThemeToggle: React.FC<
  ButtonPrimitive.Props & VariantProps<typeof buttonVariants>
> = (props) => {
  const { setTheme, resolvedTheme, mounted } = useTheme();

  if (!mounted) return <Skeleton className="size-8 rounded-full" />;

  const nextTheme = resolvedTheme === "dark" ? "light" : "dark";

  const switchText =
    nextTheme === "dark" ? "Put the sun in timeout" : "Let the sun back in";

  return (
    <Button
      {...props}
      onClick={() => setTheme(nextTheme)}
      aria-label={`Switch to ${nextTheme} mode`}
      title={switchText}
    >
      <IconSwap>
        <IconSwapItem key={resolvedTheme}>
          {resolvedTheme === "dark" ? (
            <Sun aria-hidden="true" />
          ) : (
            <Moon aria-hidden="true" />
          )}
        </IconSwapItem>
      </IconSwap>

      <span className="sr-only">{switchText}</span>
    </Button>
  );
};
