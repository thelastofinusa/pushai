/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  typedRoutes: true,
  experimental: {
    typedEnv: true,
  },
}

export default nextConfig
