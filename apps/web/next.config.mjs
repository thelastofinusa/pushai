import { withTypedAssets } from "@typest/nextjs/plugin"

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: ["api.producthunt.com"],
    qualities: [100],
  },
  transpilePackages: ["@workspace/ui"],
  typedRoutes: true,
  experimental: {
    typedEnv: true,
  },
}

export default withTypedAssets({
  sources: [{ dir: "public" }],
})(nextConfig)
