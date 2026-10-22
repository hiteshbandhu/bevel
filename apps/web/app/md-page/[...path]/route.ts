import TurndownService from "turndown"

/**
 * A guide or post as Markdown, for LLMs and agents: /blog/<slug>.md and
 * /docs/<slug>.md (rewrites in next.config.ts). The page is rendered as usual
 * and its article converted, so the Markdown can't drift from the page. Live
 * demos (data-llm="omit") are dropped; code blocks are kept.
 */
export const dynamic = "force-dynamic"

const allowed = /^(blog\/[a-z0-9-]+|docs(\/[a-z0-9-]+)?)$/

const turndown = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced", bulletListMarker: "-" })
turndown.remove((node) => (node as HTMLElement).getAttribute?.("data-llm") === "omit")
turndown.remove(["script", "style", "button", "noscript"])
turndown.remove((node) => node.nodeName.toLowerCase() === "svg")
// Code blocks are a figure with a caption naming the file, then the highlighted pre.
turndown.addRule("codeBlock", {
  filter: (node) => node.nodeName === "PRE",
  replacement: (_content, node) => {
    const lang = (node as HTMLElement).closest?.("figure")?.querySelector("figcaption")?.textContent ?? ""
    // Captions are a file name ("styles.css"), "Terminal", or the language itself.
    const fence = lang === "Terminal" ? "bash" : lang.includes(".") ? lang.split(".").pop()! : lang
    return `\n\n\`\`\`${fence}\n${(node.textContent ?? "").replace(/\n$/, "")}\n\`\`\`\n\n`
  },
})
turndown.remove((node) => node.nodeName === "FIGCAPTION" && !!(node as HTMLElement).closest?.("figure")?.querySelector("pre"))

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path.join("/")
  if (!allowed.test(path)) return new Response("Not found", { status: 404 })

  const url = new URL(`/${path}`, request.url)
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return new Response("Not found", { status: 404 })
  const html = await res.text()
  const article = html.match(/<article[\s\S]*<\/article>/)?.[0]
  if (!article) return new Response("Not found", { status: 404 })

  const markdown = turndown.turndown(article).replace(/\n{3,}/g, "\n\n").trim()
  return new Response(`${markdown}\n\nSource: ${url.href}\n`, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
