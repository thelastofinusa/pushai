import { siteConfig } from "@/config/site.config"
import { NextResponse } from "next/server"

export const revalidate = 3600

export async function GET() {
  try {
    const res = await fetch(
      `https://registry.npmjs.org/${siteConfig.name.toLowerCase()}/latest`,
      { next: { revalidate: revalidate } }
    )

    const data = await res.json()

    return NextResponse.json(data.version || "0.0.0")
  } catch {
    return NextResponse.json("0.0.0")
  }
}
