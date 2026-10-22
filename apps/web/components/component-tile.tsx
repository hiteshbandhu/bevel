import Link from "next/link"
import { cn } from "@workspace/ui/lib/utils"
import { previews } from "@/components/previews"
import { componentHref, type ComponentDoc } from "@/lib/catalog"

/**
 * A component on its own tray, with its name below. Every tray is the same
 * height and the object sits centred in it, so names and descriptions line
 * up across a row however tall each object is.
 */
export function ComponentTile({ component, compact }: { component: ComponentDoc; compact?: boolean }) {
  const Preview = previews[component.slug]
  return (
    <Link
      href={componentHref(component)}
      className="group flex h-full flex-col rounded-(--bevel-radius-xl) outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <div
        className={cn(
          "tray flex items-center justify-center overflow-hidden rounded-(--bevel-radius-xl) px-6",
          compact ? "h-56" : "h-64"
        )}
      >
        <div
          inert
          aria-hidden
          data-slot="tile-preview"
          className={cn(
            "w-full max-w-64 transition-[translate] duration-(--bevel-duration-small) ease-(--bevel-ease-out) group-hover:-translate-y-1 motion-reduce:transition-none",
            // Previews are drawn for the full tray; the compact one scales the object, not its layout.
            // Essentials are everyday-sized controls already, so they keep their size.
            compact && component.category !== "essentials" && "scale-[0.75]"
          )}
        >
          {Preview && <Preview />}
        </div>
      </div>
      <p className={cn("font-semibold", compact ? "mt-3" : "mt-4")}>{component.name}</p>
      <p className={cn("mt-1 text-sm text-muted-foreground", compact && "line-clamp-2")}>
        {/* A compact tile says the first sentence whole rather than cutting the full text mid-clause. */}
        {compact ? component.description.split(/(?<=[.!?])\s/)[0] : component.description}
      </p>
    </Link>
  )
}
