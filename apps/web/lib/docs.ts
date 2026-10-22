/** The written guides, in reading order. Each has a page at /docs/<slug> (the first at /docs). */
export const guides = [
  { slug: "", title: "Introduction", description: "What Bevel is: skeuomorphic React components on Base UI and Tailwind, and the rules every component follows." },
  { slug: "installation", title: "Installation", description: "Install Bevel components with the shadcn CLI, by the @bevel namespace or by URL, into any React and Tailwind v4 project." },
  { slug: "ai", title: "Use with AI", description: "Let Claude Code, Cursor or Copilot find, install and use Bevel components." },
  { slug: "design-system", title: "Design system", description: "Light, depth, materials, motion and shape: the tokens everything reads." },
  { slug: "theming", title: "Theming", description: "Dark mode, palettes and materials: change the look without forking a component." },
  { slug: "accessibility", title: "Accessibility", description: "How Bevel components work with the keyboard, screen readers, reduced motion and forced colours, and what each one announces." },
  { slug: "motion", title: "Motion", description: "Why Bevel components move the way they do: durations by purpose, a spring curve, and motion that never animates layout." },
  { slug: "sound", title: "Sound and haptics", description: "Opt-in clicks, detents and thunks, synthesised in the browser. Off unless you turn them on." },
] as const

export const guideHref = (slug: string) => (slug ? `/docs/${slug}` : "/docs")

export const repoUrl = "https://github.com/hiteshbandhu/bevel"

/** The maker, on X. */
export const xHandle = "_hiteshbandhu"
export const xUrl = `https://x.com/${xHandle}`
