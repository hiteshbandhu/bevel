// Prints every public URL of the site, one per line, from the same list as
// the sitemap. The IndexNow workflow uses it instead of fetching the
// sitemap, which Vercel blocks from CI runners.
//   SITE_URL=https://bevel-ui.vercel.app node scripts/site-urls.mts
import { pages } from "../apps/web/lib/pages.ts"

const site = (process.env.SITE_URL ?? "https://bevel-ui.vercel.app").replace(/\/$/, "")
for (const { path } of pages) console.log(`${site}${path === "/" ? "" : path}`)
