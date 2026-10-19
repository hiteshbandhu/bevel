/** The written guides, in reading order. Each has a page at /docs/<slug> (the first at /docs). */
export const guides = [
  { slug: "", title: "Introduction", description: "What Bevel is, and the rules every component follows." },
  { slug: "installation", title: "Installation", description: "Add components with the shadcn CLI, by namespace or by URL." },
  { slug: "design-system", title: "Design system", description: "Light, depth, materials, motion and shape: the tokens everything reads." },
  { slug: "theming", title: "Theming", description: "Dark mode, palettes and materials: change the look without forking a component." },
  { slug: "accessibility", title: "Accessibility", description: "Keyboard, screen readers, reduced motion and forced colours." },
  { slug: "motion", title: "Motion", description: "Why things move the way they do, and how to keep it fast." },
] as const

export const guideHref = (slug: string) => (slug ? `/docs/${slug}` : "/docs")

export const repoUrl = "https://github.com/hiteshbandhu/bevel"

/** The maker, on X. */
export const xHandle = "_hiteshbandhu"
export const xUrl = `https://x.com/${xHandle}`
