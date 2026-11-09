import { repoUrl } from "@/lib/docs"

const api = repoUrl.replace("https://github.com/", "https://api.github.com/repos/")

let stars: Promise<number | null> | undefined

/**
 * The repo's star count, read once per build and baked into the static pages.
 * Null if GitHub can't be reached, so the button still renders.
 *
 * No `next.revalidate` on purpose: the root layout calls this, and a revalidate
 * there puts every page on that ISR timer, so each page regenerated and was
 * written to the ISR cache every hour. A plain fetch runs once at build time.
 * The promise is kept per process because the unauthenticated GitHub API
 * allows 60 requests an hour, and the build renders every page.
 */
export function getStars(): Promise<number | null> {
  stars ??= fetchStars()
  return stars
}

async function fetchStars(): Promise<number | null> {
  try {
    const res = await fetch(api, { headers: { Accept: "application/vnd.github+json" } })
    if (!res.ok) return null
    const { stargazers_count } = (await res.json()) as { stargazers_count: number }
    return stargazers_count
  } catch {
    return null
  }
}
