import type { Metadata } from "next"
import { xHandle } from "@/lib/docs"

/**
 * Link-preview metadata for a page: its image in public/og (rendered by
 * apps/video/scripts/og.mts), for Open Graph and X. A page's openGraph and
 * twitter replace the layout's whole, so this sets every field each time.
 */
export function preview({ title, description, image }: { title: string; description: string; image: string }): Metadata {
  const images = [{ url: `/og/${image}`, width: 1200, height: 630, alt: title }]
  return {
    openGraph: { title, description, images, siteName: "Bevel", type: "website" },
    twitter: { card: "summary_large_image", creator: `@${xHandle}`, title, description, images },
  }
}
