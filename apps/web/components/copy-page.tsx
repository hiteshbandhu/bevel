"use client"

import { usePathname } from "next/navigation"
import { MenuCopyPage } from "@/components/demos/menu-copy-page"

/**
 * The "Copy page" menu for a page with a Markdown twin: its URL plus ".md"
 * (rewrites in next.config.ts). It's the Menu demo itself, so the docs show
 * what the site runs.
 */
export function CopyPage() {
  const pathname = usePathname()
  return (
    <div data-llm="omit" className="shrink-0">
      <MenuCopyPage markdownUrl={`${pathname}.md`} />
    </div>
  )
}
