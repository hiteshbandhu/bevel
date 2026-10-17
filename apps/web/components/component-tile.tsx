import Link from "next/link"
import { previews } from "@/components/previews"
import { componentHref, type ComponentDoc } from "@/lib/catalog"

/**
 * A component on its own tray, with its name below. Every tray is the same
 * height and the object sits centred in it, so names and descriptions line
 * up across a row however tall each object is.
 */
export function ComponentTile({ component }: { component: ComponentDoc }) {
  const Preview = previews[component.slug]
  return (
    <Link
      href={componentHref(component)}
      className="group flex h-full flex-col rounded-(--bevel-radius-xl) outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <div className="tray flex h-64 items-center justify-center overflow-hidden rounded-(--bevel-radius-xl) px-6">
        <div
          inert
          aria-hidden
          data-slot="tile-preview"
          className="w-full max-w-64 transition-[translate] duration-(--bevel-duration-small) ease-(--bevel-ease-out) group-hover:-translate-y-1 motion-reduce:transition-none"
        >
          {Preview && <Preview />}
        </div>
      </div>
      <p className="mt-4 font-semibold">{component.name}</p>
      <p className="mt-1 text-sm text-muted-foreground">{component.description}</p>
    </Link>
  )
}
