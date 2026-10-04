import { Button } from "@/components/ui/shadcn/button";

const variants = [
  "default",
  "secondary",
  "destructive",
  "ghost",
  "link",
  "outline",
] as const;

const sizes = [
  "xs",
  "sm",
  "default",
  "lg",
  "icon-xs",
  "icon-sm",
  "icon",
  "icon-lg",
] as const;

export default function ButtonVariants() {
  return (
    <div className="flex flex-col gap-10 p-6">
      {/* Variants */}
      <section className="flex flex-col gap-4">
        <h2 className="font-medium text-sm">Variants</h2>

        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </div>
      </section>

      {/* Sizes */}
      <section className="flex flex-col gap-4">
        <h2 className="font-medium text-sm">Sizes</h2>

        <div className="flex flex-wrap items-center gap-2">
          {sizes.map((size) => (
            <Button key={size} variant="outline" size={size}>
              {size.startsWith("icon") ? "●" : size}
            </Button>
          ))}
        </div>
      </section>

      {/* Variant × Size */}
      <section className="flex flex-col gap-4">
        <h2 className="font-medium text-sm">Variants × Sizes</h2>

        <div className="overflow-x-auto">
          <div className="min-w-max space-y-4">
            {variants.map((variant) => (
              <div key={variant} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-muted-foreground text-xs">
                  {variant}
                </span>

                {sizes.map((size) => (
                  <Button
                    key={`${variant}-${size}`}
                    variant={variant}
                    size={size}
                  >
                    {size.startsWith("icon") ? "●" : "Home Page"}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
