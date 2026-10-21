import type { Metadata } from "next"
import { guides, guideHref, xHandle } from "@/lib/docs"

type Alternates = NonNullable<Metadata["alternates"]>

const llms = { "text/plain": [{ url: "/llms.txt", title: "Bevel docs for LLMs" }] }

/**
 * A page's search and link-preview metadata: its canonical address, and its
 * image in public/og (rendered by apps/video/scripts/og.mts) for Open Graph
 * and X. A page's openGraph, twitter and alternates replace the layout's
 * whole, so this sets every field each time.
 */
export function preview({
  title,
  description,
  image,
  path,
  types,
  type = "website",
}: {
  title: string
  description: string
  image: string
  /** The page's own path, e.g. "/components/meter". Becomes the canonical URL. */
  path: string
  types?: Alternates["types"]
  type?: "website" | "article"
}): Metadata {
  const images = [{ url: `/og/${image}`, width: 1200, height: 630, alt: title }]
  return {
    alternates: { canonical: path, types: { ...llms, ...types } },
    openGraph: { title, description, images, url: path, siteName: "Bevel", type },
    twitter: { card: "summary_large_image", creator: `@${xHandle}`, title, description, images },
  }
}

/** A guide's metadata, from its entry in the guides list. */
export function guideMetadata(slug: (typeof guides)[number]["slug"]): Metadata {
  const guide = guides.find((g) => g.slug === slug)!
  return {
    title: guide.title,
    description: guide.description,
    ...preview({ title: `${guide.title} – Bevel`, description: guide.description, image: "bevel.jpg", path: guideHref(slug), type: "article" }),
  }
}
