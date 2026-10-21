import type { MetadataRoute } from "next"
import { postHref, posts } from "@/lib/blog"
import { componentHref, components } from "@/lib/catalog"
import { demoSites } from "@/lib/demos"
import { guideHref, guides } from "@/lib/docs"
import { siteUrl } from "@/lib/site"

/** Every public page, for search engines. Built from the same lists as the site, so it can't fall behind. */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${siteUrl}${path === "/" ? "" : path}`
  return [
    { url: url("/"), priority: 1 },
    { url: url("/components"), priority: 0.9 },
    ...components.map((c) => ({ url: url(componentHref(c)), priority: c.parent ? 0.6 : 0.8 })),
    ...guides.map((g) => ({ url: url(guideHref(g.slug)), priority: 0.7 })),
    { url: url("/themes"), priority: 0.7 },
    { url: url("/demo"), priority: 0.6 },
    ...demoSites.map((d) => ({ url: url(`/demo/${d.n}`), priority: 0.6 })),
    { url: url("/blog"), priority: 0.5 },
    ...posts.map((p) => ({ url: url(postHref(p.slug)), lastModified: p.date, priority: 0.7 })),
  ]
}
