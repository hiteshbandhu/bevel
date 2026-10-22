/** Posts, newest first. Each has a page at /blog/<slug>; `objects` are the components on its link-preview image. */
export const posts = [
  {
    slug: "neo-skeuomorphism",
    title: "Neo-skeuomorphism: what it is, with live examples",
    description:
      "Neo-skeuomorphism (skeuomorphism 2.0) brings light, depth and physical behaviour back to the controls that matter. Its rules, and live React examples.",
    date: "2026-10-22",
    objects: ["detent-knob", "meter", "dip-switch"],
  },
  {
    slug: "skeuomorphism-vs-neumorphism",
    title: "Skeuomorphism vs neumorphism vs flat design",
    description:
      "Skeuomorphism vs neumorphism vs flat design: the same button in each style, live, with CSS, and how they differ in depth, contrast and accessibility.",
    date: "2026-10-22",
    objects: ["guarded-switch", "breaker", "annunciator"],
  },
  {
    slug: "skeuomorphic-button-css",
    title: "How to make a skeuomorphic button in CSS and Tailwind",
    description:
      "A skeuomorphism CSS tutorial: build a skeuomorphic button with one light source, stacked shadows and a real press. Live at every step, plus Tailwind v4.",
    date: "2026-10-22",
    objects: ["guarded-switch", "dip-switch", "breaker"],
  },
  {
    slug: "skeuomorphism-is-back",
    title: "Skeuomorphism is back, for a better reason this time",
    description:
      "Flat design took away the shape of things, and with it a lot of what an interface used to tell you. A few old machines, the patents behind them, and what they still teach.",
    date: "2026-10-20",
    objects: ["number-wheel", "guarded-switch", "split-flap"],
  },
] as const

export type Post = (typeof posts)[number]

export const postHref = (slug: string) => `/blog/${slug}`

export const formatPostDate = (date: string) =>
  new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(new Date(date))
