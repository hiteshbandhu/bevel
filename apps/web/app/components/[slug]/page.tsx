import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ComponentDocPage } from "@/components/component-doc"
import { components, getComponent } from "@/lib/catalog"

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
  return component ? { title: component.name, description: component.description } : {}
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const component = getComponent((await params).slug)
  if (!component || component.parent) notFound()
  return <ComponentDocPage component={component} />
}
