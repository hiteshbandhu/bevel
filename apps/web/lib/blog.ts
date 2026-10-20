/** Posts, newest first. Each has a page at /blog/<slug>. */
export const posts = [
  {
    slug: "skeuomorphism-is-back",
    title: "Skeuomorphism is back, for a better reason this time",
    description:
      "Flat design took away the shape of things, and with it a lot of what an interface used to tell you. A few old machines, the patents behind them, and what they still teach.",
    date: "2026-10-20",
  },
] as const

export type Post = (typeof posts)[number]

export const postHref = (slug: string) => `/blog/${slug}`

export const formatPostDate = (date: string) =>
  new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(new Date(date))
