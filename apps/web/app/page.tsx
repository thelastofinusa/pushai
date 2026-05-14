import { Button } from "@workspace/ui/components/button"
import { Search } from "lucide-react"

export default function Page() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-head text-4xl font-black uppercase">
            Project is ready
          </h1>
          <p>You may now add components and start building.</p>
          <p>We&apos;ve already added the button component for you.</p>
          <Button className="mt-2" variant="default">
            Button
          </Button>
          <Button className="mt-2" variant="secondary">
            Button
          </Button>
          <Button className="mt-2" variant="outline">
            Button
          </Button>
          <Button className="mt-2" variant="ghost">
            Button
          </Button>
          <Button className="mt-2" variant="default" size="icon">
            <Search size={16} />
          </Button>
          <Button className="mt-2" variant="secondary" size="icon">
            <Search size={16} />
          </Button>
          <Button className="mt-2" variant="outline" size="icon">
            <Search size={16} />
          </Button>
          <Button className="mt-2" variant="ghost" size="icon">
            <Search size={16} />
          </Button>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div>
      </div>
    </div>
  )
}
