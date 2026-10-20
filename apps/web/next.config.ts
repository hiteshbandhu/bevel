import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  async rewrites() {
    return {
      // A component's page URL plus ".md" is its Markdown, for LLMs (see lib/llms.ts).
      beforeFiles: [
        { source: "/components/:slug([a-z0-9-]+).md", destination: "/md/:slug" },
        { source: "/components/:parent([a-z0-9-]+)/:slug([a-z0-9-]+).md", destination: "/md/:slug" },
      ],
    }
  },
}

export default nextConfig
