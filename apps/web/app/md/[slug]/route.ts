import { components, getComponent } from "@/lib/catalog"
import { componentMarkdown, textResponse } from "@/lib/llms"

// One component as Markdown. Served at /components/<slug>.md (and
// /components/<parent>/<slug>.md for parts) by a rewrite in next.config.ts.

export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return components.map((c) => ({ slug: c.slug }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const component = getComponent((await params).slug)
  if (!component) return new Response("Not found", { status: 404 })
  return textResponse(await componentMarkdown(component), "text/markdown")
}
