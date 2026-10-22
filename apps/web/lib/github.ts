import { repoUrl } from "@/lib/docs"

const api = repoUrl.replace("https://github.com/", "https://api.github.com/repos/")

/** The repo's star count, refreshed hourly. Null if GitHub can't be reached, so the button still renders. */
export async function getStars(): Promise<number | null> {
  try {
    const res = await fetch(api, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const { stargazers_count } = (await res.json()) as { stargazers_count: number }
    return stargazers_count
  } catch {
    return null
  }
}
