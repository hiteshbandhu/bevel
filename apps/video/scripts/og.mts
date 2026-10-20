// Renders the link-preview images: one for the site, one per component and
// one per demo, into apps/web/public/og; and the GitHub social preview into
// launch-kit/. One bundle, one browser.
//   node scripts/og.mts            (from apps/video)
//   node scripts/og.mts og-post    (only the jobs for one still)
import { mkdir } from "node:fs/promises"
import path from "node:path"
import { bundle } from "@remotion/bundler"
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer"
import { enableTailwind } from "@remotion/tailwind-v4"
import { components } from "../../web/lib/catalog.ts"
import { demoSites } from "../../web/lib/demos.ts"
import { posts } from "../../web/lib/blog.ts"

const root = path.resolve(import.meta.dirname, "../../..")
const ogDir = path.join(root, "apps/web/public/og")
const kitDir = path.join(root, "launch-kit")
await mkdir(ogDir, { recursive: true })
await mkdir(kitDir, { recursive: true })

const serveUrl = await bundle({
  entryPoint: path.resolve(import.meta.dirname, "../src/index.ts"),
  webpackOverride: (config) => enableTailwind(config),
})
const browser = await openBrowser("chrome")

const jobs: { id: string; props: Record<string, unknown>; out: string; format: "jpeg" | "png" }[] = [
  { id: "og-site", props: {}, out: path.join(ogDir, "bevel.jpg"), format: "jpeg" },
  { id: "social-preview", props: { social: true }, out: path.join(kitDir, "github-social-preview.png"), format: "png" },
  ...demoSites.map((s) => ({ id: "og-demo", props: { n: s.n }, out: path.join(ogDir, `demo-${s.n}.jpg`), format: "jpeg" as const })),
  ...components.map((c) => ({ id: "og-component", props: { slug: c.slug }, out: path.join(ogDir, `${c.slug}.jpg`), format: "jpeg" as const })),
  ...posts.map((p) => ({ id: "og-post", props: { slug: p.slug }, out: path.join(ogDir, `blog-${p.slug}.jpg`), format: "jpeg" as const })),
].filter((job) => !process.argv[2] || job.id === process.argv[2])

for (const job of jobs) {
  const composition = await selectComposition({ serveUrl, id: job.id, inputProps: job.props, puppeteerInstance: browser })
  await renderStill({
    composition,
    serveUrl,
    output: job.out,
    inputProps: job.props,
    imageFormat: job.format,
    ...(job.format === "jpeg" ? { jpegQuality: 88 } : {}),
    puppeteerInstance: browser,
  })
  console.log(path.relative(root, job.out))
}
await browser.close({ silent: true })
