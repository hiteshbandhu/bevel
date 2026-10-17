import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ComponentDocPage } from "@/components/component-doc"
import { components, getComponent } from "@/lib/catalog"

export const dynamicParams = false

export function generateStaticParams() {
  return components.filter((c) => c.parent).map((c) => ({ slug: c.parent!, sub: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; sub: string }>
}): Promise<Metadata> {
  const component = getComponent((await params).sub)
  return component ? { title: component.name, description: component.description } : {}
}

export default async function SubcomponentPage({
  params,
}: {
  params: Promise<{ slug: string; sub: string }>
}) {
  const { slug, sub } = await params
  const component = getComponent(sub)
  if (!component || component.parent !== slug) notFound()
  return <ComponentDocPage component={component} />
}
