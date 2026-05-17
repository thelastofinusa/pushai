import { siteConfig } from "@/config/site.config"
import { NextResponse } from "next/server"

export const revalidate = 3600

export async function GET() {
  try {
    const res = await fetch(
      `https://img.shields.io/npm/dt/${siteConfig.name.toLowerCase()}.json`,
      { next: { revalidate } }
    )

    const npmData = await res.json()

    return NextResponse.json(npmData.value || "0")
  } catch {
    return NextResponse.json(0)
  }
}
