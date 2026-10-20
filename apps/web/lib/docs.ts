/** The written guides, in reading order. Each has a page at /docs/<slug> (the first at /docs). */
export const guides = [
  { slug: "", title: "Introduction", description: "What Bevel is, and the rules every component follows." },
  { slug: "installation", title: "Installation", description: "Add components with the shadcn CLI, by namespace or by URL." },
  { slug: "ai", title: "Use with AI", description: "Let Claude Code, Cursor or Copilot find, install and use Bevel components." },
  { slug: "design-system", title: "Design system", description: "Light, depth, materials, motion and shape: the tokens everything reads." },
  { slug: "theming", title: "Theming", description: "Dark mode, palettes and materials: change the look without forking a component." },
  { slug: "accessibility", title: "Accessibility", description: "Keyboard, screen readers, reduced motion and forced colours." },
  { slug: "motion", title: "Motion", description: "Why things move the way they do, and how to keep it fast." },
  { slug: "sound", title: "Sound and haptics", description: "Opt-in clicks, detents and thunks, synthesised in the browser. Off unless you turn them on." },
] as const

export const guideHref = (slug: string) => (slug ? `/docs/${slug}` : "/docs")

export const repoUrl = "https://github.com/hiteshbandhu/bevel"

/** The maker, on X. */
export const xHandle = "_hiteshbandhu"
export const xUrl = `https://x.com/${xHandle}`
