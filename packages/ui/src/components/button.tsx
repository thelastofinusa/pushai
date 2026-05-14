import * as React from "react"
import { Loader } from "lucide-react"
import * as ButtonPrimitive from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@workspace/ui/lib/utils"

const buttonVariants = cva(
  "flex cursor-pointer items-center justify-center font-sans font-medium transition-all duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        default:
          "border-2 border-black bg-primary text-primary-foreground shadow-md transition hover:translate-y-0.5 hover:bg-primary-hover hover:shadow active:translate-x-1 active:translate-y-1 active:shadow-none",
        secondary:
          "hover:bg-secondary-hover border-2 border-black bg-secondary text-secondary-foreground shadow-md shadow-primary transition hover:translate-y-0.5 hover:shadow active:translate-x-1 active:translate-y-1 active:shadow-none",
        outline:
          "border-2 bg-transparent shadow-md transition hover:translate-y-0.5 hover:shadow active:translate-x-1 active:translate-y-1 active:shadow-none",
        link: "bg-transparent hover:underline",
        ghost: "bg-transparent hover:bg-accent",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = React.ComponentPropsWithoutRef<
  typeof ButtonPrimitive.Button
> &
  VariantProps<typeof buttonVariants> & {
    isLoading?: boolean
    loadingText?: string
  }

function Button({
  className,
  variant = "default",
  size = "default",
  isLoading = false,
  loadingText,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive.Button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader className="size-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </ButtonPrimitive.Button>
  )
}

export { Button, buttonVariants }
