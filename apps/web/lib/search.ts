import { postHref, posts } from "@/lib/blog"
import { categories, componentHref, components, getComponent } from "@/lib/catalog"
import { demoSites } from "@/lib/demos"
import { guideHref, guides } from "@/lib/docs"

export type SearchEntry = {
  href: string
  title: string
  description: string
  /** Where it sits: the category, the parent component, or the demo's kind. */
  context?: string
}

export type SearchGroup = {
  /** The group's heading. Base UI reads `value` as the group's identity. */
  value: "Components" | "Guides" | "Demos" | "Blog"
  items: SearchEntry[]
}

/**
 * Everything the ⌘K palette can find. Built on the server and passed to the
 * client as props, so the full catalogue never ships as a module.
 */
export function buildSearchIndex(): SearchGroup[] {
  const categoryName = new Map(categories.map((c) => [c.slug, c.name]))

  const groups: SearchGroup[] = [
    {
      value: "Components",
      items: components.map((c) => ({
        href: componentHref(c),
        title: c.name,
        description: c.description,
        context: c.parent
          ? `Part of ${getComponent(c.parent)?.name ?? c.parent}`
          : categoryName.get(c.category),
      })),
    },
    {
      value: "Guides",
      items: [
        ...guides.map((g) => ({ href: guideHref(g.slug), title: g.title, description: g.description })),
        {
          href: "/themes",
          title: "Material themes",
          description: "Brass, bakelite and anodized themes, and a playground to build your own.",
        },
      ],
    },
    {
      value: "Demos",
      items: demoSites.map((d) => ({
        href: `/demo/${d.n}`,
        title: d.name,
        description: d.description,
        context: d.kind,
      })),
    },
    {
      value: "Blog",
      items: posts.map((p) => ({ href: postHref(p.slug), title: p.title, description: p.description })),
    },
  ]

  return groups.filter((g) => g.items.length > 0)
}
