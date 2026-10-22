"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { DocsNav } from "@/components/docs-nav"

/**
 * Below lg the sidebar would be a screen of links before the page starts, so
 * it folds behind one row and closes again once a link is followed.
 */
export function DocsNavMobile() {
  const pathname = usePathname()
  const ref = React.useRef<HTMLDetailsElement>(null)
  React.useEffect(() => {
    if (ref.current) ref.current.open = false
  }, [pathname])
  return (
    <details ref={ref} className="group rounded-(--bevel-radius-md) border lg:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-(--bevel-radius-md) px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        Browse the docs
        <ChevronDown
          aria-hidden
          className="size-4 text-muted-foreground transition-transform duration-(--bevel-duration-small) ease-(--bevel-ease-out) group-open:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      {/* Scrolls in place, so closing it doesn't mean scrolling back past fifty links. */}
      <div className="max-h-[60svh] overflow-y-auto overscroll-contain border-t px-3 py-4">
        <DocsNav />
      </div>
    </details>
  )
}
