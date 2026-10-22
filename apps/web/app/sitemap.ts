import type { MetadataRoute } from "next"
import { pages } from "@/lib/pages"
import { siteUrl } from "@/lib/site"

/** Every public page, for search engines. Built from the same lists as the site, so it can't fall behind. */
export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map(({ path, priority, lastModified }) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    priority,
    ...(lastModified ? { lastModified } : {}),
  }))
}
