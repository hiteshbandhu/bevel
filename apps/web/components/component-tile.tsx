import Link from "next/link"
import { previews } from "@/components/previews"
import { componentHref, type ComponentDoc } from "@/lib/catalog"

/** A component shown as the object itself on the mat, with its name below. */
export function ComponentTile({ component }: { component: ComponentDoc }) {
  const Preview = previews[component.slug]
  return (
    <Link
      href={componentHref(component)}
      className="group block rounded-(--bevel-radius-lg) outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <div
        inert
        aria-hidden
        className="flex justify-center transition-[translate] duration-(--bevel-duration-small) ease-(--bevel-ease-out) group-hover:-translate-y-1 motion-reduce:transition-none"
      >
        <div className="w-full max-w-72">{Preview && <Preview />}</div>
      </div>
      <p className="mt-5 font-semibold">{component.name}</p>
      <p className="mt-1 text-sm text-muted-foreground">{component.description}</p>
    </Link>
  )
}
