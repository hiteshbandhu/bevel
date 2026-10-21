import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ComponentDocPage } from "@/components/component-doc"
import { JsonLd, componentData } from "@/components/json-ld"
import { componentHref, components, getComponent } from "@/lib/catalog"
import { componentAlternates } from "@/lib/llms"
import { preview } from "@/lib/og"

export const dynamicParams = false

export function generateStaticParams() {
  return components.filter((c) => !c.parent).map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const component = getComponent((await params).slug)
  if (!component) return {}
  return {
    title: `${component.name}: skeuomorphic React component`,
    description: component.description,
    ...preview({
      title: `${component.name} – Bevel`,
      description: component.description,
      image: `${component.slug}.jpg`,
      path: componentHref(component),
      types: componentAlternates(component).types,
    }),
  }
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const component = getComponent((await params).slug)
  if (!component || component.parent) notFound()
  return (
    <>
      <JsonLd data={componentData(component)} />
      <ComponentDocPage component={component} />
    </>
  )
}
