import { componentHref, getComponent, type ComponentDoc } from "@/lib/catalog"
import { repoUrl, xUrl } from "@/lib/docs"
import { siteUrl } from "@/lib/site"

/**
 * Structured data for search engines and AI search, rendered as a script
 * tag in the page (the Next.js recommendation). `<` is escaped so text
 * from the catalog can't close the tag.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  )
}

export const author = {
  "@type": "Person",
  name: "hiteshbandhu",
  url: xUrl,
  sameAs: [xUrl, "https://github.com/hiteshbandhu"],
}

/** The library itself: open-source React code on GitHub. */
export const library = {
  "@type": "SoftwareSourceCode",
  "@id": `${siteUrl}/#library`,
  name: "Bevel",
  description:
    "An open-source library of skeuomorphic React components, built on Base UI and Tailwind CSS v4 and installed with the shadcn CLI.",
  url: siteUrl,
  codeRepository: repoUrl,
  programmingLanguage: ["TypeScript", "React", "CSS"],
  runtimePlatform: "Web browser",
  license: "https://opensource.org/licenses/MIT",
  keywords: "skeuomorphic, skeuomorphism, tactile UI, React components, shadcn registry, Base UI, Tailwind CSS",
  author,
}

/** Breadcrumbs from the home page down to this one. */
export const breadcrumbs = (trail: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map((crumb, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: crumb.name,
    item: `${siteUrl}${crumb.path}`,
  })),
})

/** A component page: the component as source code in the library, and its breadcrumbs. */
export function componentData(component: ComponentDoc) {
  const parent = component.parent ? getComponent(component.parent) : undefined
  return [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareSourceCode",
      name: `${component.name}, a skeuomorphic React component`,
      description: component.description,
      url: `${siteUrl}${componentHref(component)}`,
      programmingLanguage: "TypeScript",
      codeRepository: repoUrl,
      license: "https://opensource.org/licenses/MIT",
      isPartOf: { "@id": `${siteUrl}/#library` },
      author,
    },
    breadcrumbs([
      { name: "Components", path: "/components" },
      ...(parent ? [{ name: parent.name, path: componentHref(parent) }] : []),
      { name: component.name, path: componentHref(component) },
    ]),
  ]
}
