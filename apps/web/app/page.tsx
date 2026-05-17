import React from "react"
import { Hero } from "./components/hero"

export default function Page() {
  return (
    <div className="flex-1">
      <Hero />
    </div>
  )
}

// import { siteConfig } from "@/config/site.config"
// import { imagePath } from "@typest/nextjs"
// import { Button } from "@workspace/ui/components/button"
// import { Input } from "@workspace/ui/components/input"
// import { Textarea } from "@workspace/ui/components/textarea"
// import { Search } from "lucide-react"
// import Image from "next/image"

// export default function Page() {
//   return (
//     <div className="flex min-h-svh p-6">
//       <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
//         <div>
//           <Image
//             src={imagePath("logo.svg")}
//             alt={siteConfig.name}
//             width={32}
//             height={32}
//             priority
//           />
//           <h1 className="font-head text-4xl font-black uppercase">
//             Project is ready
//           </h1>
//           <p>You may now add components and start building.</p>
//           <p>We&apos;ve already added the button component for you.</p>
//           <Button className="mt-2" variant="default">
//             Button
//           </Button>
//           <Button className="mt-2" variant="secondary">
//             Button
//           </Button>
//           <Button className="mt-2" variant="outline">
//             Button
//           </Button>
//           <Button className="mt-2" variant="ghost">
//             Button
//           </Button>
//           <Button className="mt-2" variant="" size="icon">
//             <Search size={16} />
//           </Button>
//           <Button className="mt-2" variant="secondary" size="icon">
//             <Search size={16} />
//           </Button>
//           <Button className="mt-2" variant="outline" size="icon">
//             <Search size={16} />
//           </Button>
//           <Button className="mt-2" variant="ghost" size="icon">
//             <Search size={16} />
//           </Button>

//           <Input placeholder="Search for something.." className="mt-2" />
//           <Textarea placeholder="Search for something.." className="mt-2" />
//         </div>
//         <div className="text-muted-foreground font-mono text-xs">
//           (Press <kbd>d</kbd> to toggle dark mode)
//         </div>
//       </div>
//     </div>
//   )
// }
