import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  experimental: {
    agentUpgrade: "security",
  },
  async rewrites() {
    return {
      // A component's page URL plus ".md" is its Markdown, for LLMs (see lib/llms.ts).
      beforeFiles: [
        { source: "/components/:slug([a-z0-9-]+).md", destination: "/md/:slug" },
        { source: "/components/:parent([a-z0-9-]+)/:slug([a-z0-9-]+).md", destination: "/md/:slug" },
        // Guides and posts as Markdown, converted from the rendered page (app/md-page).
        { source: "/docs.md", destination: "/md-page/docs" },
        { source: "/docs/:slug([a-z0-9-]+).md", destination: "/md-page/docs/:slug" },
        { source: "/blog/:slug([a-z0-9-]+).md", destination: "/md-page/blog/:slug" },
      ],
    }
  },
}

export default nextConfig
