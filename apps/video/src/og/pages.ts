import { guides } from "../../../web/lib/docs.ts"

/**
 * Pages that aren't a component, post or demo but still get their own link
 * preview: the docs guides and the index pages. Each shows a few objects that
 * say what the page is about. The image is public/og/page-<id>.jpg.
 */
export type OgPageEntry = { id: string; eyebrow: string; title: string; description: string; objects: string[] }

const guideObjects: Record<string, string[]> = {
  "": ["guarded-switch", "meter", "split-flap", "wallet"],
  installation: ["kbd", "key", "preset-keys", "badge"],
  ai: ["task-plan", "citation", "approval", "delegation-board"],
  "design-system": ["detent-knob", "annunciator", "dial", "toggle-lever"],
  theming: ["wallet", "payment-card", "keycard", "receipt"],
  accessibility: ["latch-checkbox", "text-field", "guarded-switch", "preset-keys"],
  motion: ["split-flap", "number-wheel", "motorized-fader", "engine-telegraph"],
  sound: ["push-to-talk", "detent-knob", "breaker", "dip-switch"],
}

/** The image name a guide's metadata points at; the introduction lives at /docs. */
export const guideImage = (slug: string) => `page-docs-${slug || "introduction"}.jpg`

export const ogPages: OgPageEntry[] = [
  {
    id: "components",
    eyebrow: "Components",
    title: "Every part, one command each",
    description: "Skeuomorphic React components for shadcn, each modelled on a real object.",
    objects: ["meter", "guarded-switch", "split-flap", "key"],
  },
  {
    id: "blog",
    eyebrow: "Blog",
    title: "Notes on interfaces with a body",
    description: "Skeuomorphism, depth and light, and the objects behind the components.",
    objects: ["number-wheel", "annunciator", "stamp", "wallet"],
  },
  {
    id: "demos",
    eyebrow: "Demos",
    title: "Whole products, built from the parts",
    description: "Four working apps made only of Bevel components.",
    objects: ["delegation-board", "ledger", "engine-telegraph", "approval"],
  },
  {
    id: "themes",
    eyebrow: "Themes",
    title: "Same parts, different materials",
    description: "Leather, brass, plastic and paper, swapped with a few tokens.",
    objects: ["wallet", "payment-card", "dial", "detent-knob"],
  },
  ...guides.map((g) => ({
    id: `docs-${g.slug || "introduction"}`,
    eyebrow: "Docs",
    title: g.title,
    description: g.description,
    objects: guideObjects[g.slug] ?? guideObjects[""]!,
  })),
]
