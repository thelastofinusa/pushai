import { buttonVariants } from "@workspace/ui/components/button"

const SHOW = true

export function TailwindIndicator({
  forceMount = false,
}: {
  forceMount?: boolean
}) {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  if (process.env.NODE_ENV === "production" || (!SHOW && !forceMount)) {
    return null
  }

  return (
    <button
      data-tailwind-indicator=""
      className={buttonVariants({
        size: "icon-lg",
        className:
          "fixed bottom-2 left-2 z-50 rounded-full font-head text-sm font-semibold",
      })}
    >
      <div className="block sm:hidden">xs</div>
      <div className="hidden sm:block md:hidden">sm</div>
      <div className="hidden md:block lg:hidden">md</div>
      <div className="hidden lg:block xl:hidden">lg</div>
      <div className="hidden xl:block 2xl:hidden">xl</div>
      <div className="hidden 2xl:block">2xl</div>
    </button>
  )
}
