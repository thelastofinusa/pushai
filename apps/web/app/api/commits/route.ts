import { siteConfig } from "@/config/site.config"
import { NextResponse } from "next/server"

export const revalidate = 3600

export async function GET() {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${siteConfig.username}/${siteConfig.name}/commits?per_page=1`,
      { next: { revalidate: revalidate } }
    )

    let commits = 0
    const link = res.headers.get("link")

    if (link) {
      const match = link.match(/&page=(\d+)>; rel="last"/)

      if (match) {
        commits = parseInt(match[1] as string, 10)
      }
    } else {
      const commitData = await res.json()

      commits = Array.isArray(commitData) ? commitData.length : 0
    }

    return NextResponse.json(commits)
  } catch {
    return NextResponse.json(0)
  }
}
