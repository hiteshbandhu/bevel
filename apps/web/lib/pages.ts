// Relative imports with extensions, so Node can run this file directly
// (scripts/site-urls.mts) as well as Next.
import { postHref, posts } from "./blog.ts"
import { componentHref, components } from "./catalog.ts"
import { demoSites } from "./demos.ts"
import { guideHref, guides } from "./docs.ts"

export type Page = { path: string; priority: number; lastModified?: string }

/** Every public page. The sitemap and the IndexNow ping both read this list. */
export const pages: Page[] = [
  { path: "/", priority: 1 },
  { path: "/components", priority: 0.9 },
  ...components.map((c) => ({ path: componentHref(c), priority: c.parent ? 0.6 : 0.8 })),
  ...guides.map((g) => ({ path: guideHref(g.slug), priority: 0.7 })),
  { path: "/themes", priority: 0.7 },
  { path: "/demo", priority: 0.6 },
  ...demoSites.map((d) => ({ path: `/demo/${d.n}`, priority: 0.6 })),
  { path: "/blog", priority: 0.5 },
  ...posts.map((p) => ({ path: postHref(p.slug), priority: 0.7, lastModified: p.date })),
]
