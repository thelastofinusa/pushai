import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { cn } from "cn";

const containerVariants = cva(
  cn(
    "mx-auto w-full px-5 sm:px-8 md:px-10 lg:px-12 xl:px-14",
    "transition-[max-width] duration-100 ease-linear",
  ),
  {
    variants: {
      size: {
        default: "max-w-[1090px]",
        lg: "max-w-[1380px]",
        md: "max-w-[900px]",
        sm: "max-w-[748px]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

type ContainerVariantsType = VariantProps<typeof containerVariants>;

function Container({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"section"> & VariantProps<typeof containerVariants>) {
  return (
    <section
      data-slot="section"
      className={cn(containerVariants({ size, className }))}
      {...props}
    />
  );
}

export { Container, type ContainerVariantsType, containerVariants };
