import type { Metadata } from "next"
import { guides, guideHref, xHandle } from "@/lib/docs"

/**
 * A description short enough for search results (Bing flags anything over
 * 160 characters): whole sentences up to `max`, or the first sentence cut at
 * a word with an ellipsis. Pages keep the full text; only the meta tag is trimmed.
 */
export function metaDescription(text: string, max = 155) {
  if (text.length <= max) return text
  let out = ""
  for (const sentence of text.split(/(?<=[.!?])\s+/)) {
    const next = out ? `${out} ${sentence}` : sentence
    if (next.length > max) break
    out = next
  }
  if (out) return out
  return `${text.slice(0, text.lastIndexOf(" ", max - 1))}…`
}

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
  description = metaDescription(description)
  return {
    description,
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
    ...preview({ title: `${guide.title} – Bevel`, description: guide.description, image: `page-docs-${slug || "introduction"}.jpg`, path: guideHref(slug), type: "article" }),
  }
}
